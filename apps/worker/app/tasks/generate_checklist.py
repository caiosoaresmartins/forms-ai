"""
Task Celery: gera checklist de documentos via Groq LLM.
Disparada após extract_parties ter concluído com sucesso.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from app.celery_app import celery_app
from app.pipelines.llm.checklist_builder import build_checklist

logger = logging.getLogger(__name__)

DATA_DIR = Path("/tmp/forms")


@celery_app.task(bind=True, name="generate_checklist", max_retries=3, default_retry_delay=10)
def generate_checklist(self, form_id: str) -> dict:
    """
    1. Lê o JSON de partes salvo por extract_parties
    2. Chama o Groq LLM para gerar a checklist
    3. Salva o resultado em {form_id}_checklist.json
    4. Retorna o dict com a checklist
    """
    logger.info("[generate_checklist] form_id=%s", form_id)

    parties_path = DATA_DIR / f"{form_id}_parties.json"
    if not parties_path.exists():
        raise FileNotFoundError(f"Arquivo de partes não encontrado: {parties_path}")

    with parties_path.open() as f:
        parties = json.load(f)

    try:
        checklist = build_checklist(parties)
    except Exception as exc:
        logger.warning("[generate_checklist] LLM falhou, tentativa %s: %s", self.request.retries, exc)
        raise self.retry(exc=exc)

    checklist_path = DATA_DIR / f"{form_id}_checklist.json"
    with checklist_path.open("w") as f:
        json.dump(checklist, f, ensure_ascii=False, indent=2)

    logger.info("[generate_checklist] checklist salva em %s", checklist_path)
    return checklist
