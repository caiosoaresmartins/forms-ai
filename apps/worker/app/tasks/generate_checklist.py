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
from app.infrastructure.storage.s3_client import S3Storage

logger = logging.getLogger(__name__)

s3 = S3Storage()


@celery_app.task(bind=True, name="generate_checklist", max_retries=3, default_retry_delay=10)
def generate_checklist(self, form_id: str) -> dict:
    """
    1. Lê o JSON de partes salvo no S3
    2. Chama o Groq LLM para gerar a checklist
    3. Salva o resultado no S3
    4. Retorna o dict com a checklist
    """
    logger.info("[generate_checklist] form_id=%s", form_id)

    parties_object = f"docs/{form_id}_parties.json"
    if not s3.exists(parties_object):
        raise FileNotFoundError(f"Arquivo de partes não encontrado: {parties_object}")

    parties = s3.download_json(parties_object)

    try:
        checklist = build_checklist(parties)
    except Exception as exc:
        logger.warning("[generate_checklist] LLM falhou, tentativa %s: %s", self.request.retries, exc)
        raise self.retry(exc=exc)

    checklist_object = f"checklists/{form_id}_checklist.json"
    s3.upload_json(checklist, checklist_object)

    logger.info("[generate_checklist] checklist salva em %s", checklist_object)
    return checklist
