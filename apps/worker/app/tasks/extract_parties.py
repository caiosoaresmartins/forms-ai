"""Task Celery: extrai partes e gera checklist via Groq LLM (ou fallback regex)."""
from __future__ import annotations
import json
import asyncio
import logging
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Executa coroutine async dentro de uma task Celery (síncrona)."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


@celery_app.task(name="tasks.extract_parties", bind=True, max_retries=3)
def extract_parties(self, form_id: str, tenant_id: str, form_json_path: str):
    """
    Fluxo:
    1. Carregar JSON do analyze_form
    2. Chamar Groq API para detectar partes
    3. Gerar checklist via Groq
    4. Fallback para regex se Groq indisponível
    5. Retornar resultado estruturado
    """
    import sys
    sys.path.insert(0, "/app")
    from app.infrastructure.storage.s3_client import S3Storage
    s3 = S3Storage()

    if not s3.exists(form_json_path):
        raise FileNotFoundError(f"JSON analisado não encontrado no S3: {form_json_path}")
        
    form_data = s3.download_json(form_json_path)

    full_text = " ".join(p["text"] for p in form_data.get("pages", []))

    import os
    groq_key = os.getenv("GROQ_API_KEY", "")

    try:
        if not groq_key:
            raise ValueError("GROQ_API_KEY vazia")

        import sys
        sys.path.insert(0, "/app")
        from apps.api.app.infrastructure.ai.groq_client import analyze_form_parties, generate_checklist

        parties = _run_async(analyze_form_parties(full_text))
        checklist = _run_async(generate_checklist(parties))

    except Exception as e:
        logger.warning(f"LLM indisponível ({e}), usando fallback regex")
        from app.pipelines.fallback.regex_extractor import extract_parties_regex, generate_checklist_default
        parties = extract_parties_regex(full_text)
        checklist = generate_checklist_default(parties)

    result = {
        "form_id": form_id,
        "tenant_id": tenant_id,
        "parties_detected": parties,
        "checklist": checklist,
        "status": "checklist_ready",
    }

    import sys
    sys.path.insert(0, "/app")
    from app.infrastructure.storage.s3_client import S3Storage
    s3 = S3Storage()

    # Salva checklist
    checklist_object = f"checklists/{form_id}_checklist.json"
    s3.upload_json(result, checklist_object)

    # Salva partes separadamente (para o caso de regenerate_checklist precisar)
    parties_object = f"docs/{form_id}_parties.json"
    s3.upload_json(parties, parties_object)

    return result
