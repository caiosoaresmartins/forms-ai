"""
Endpoints de checklist.

GET  /forms/{form_id}/checklist  → retorna checklist gerada pelo LLM
POST /forms/{form_id}/checklist  → (re)dispara a task generate_checklist
"""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends

from app.core.dependencies import get_current_user
from app.infrastructure.database.models.user import User
from app.infrastructure.storage.s3_client import S3Storage

router = APIRouter(prefix="/forms", tags=["checklist"])

s3 = S3Storage()


@router.get("/{form_id}/checklist")
async def get_checklist(
    form_id: str,
    current_user: User = Depends(get_current_user),
):
    checklist_object = f"checklists/{form_id}_checklist.json"
    if not s3.exists(checklist_object):
        raise HTTPException(status_code=404, detail="Checklist ainda não gerada")
    return s3.download_json(checklist_object)


@router.post("/{form_id}/checklist")
async def regenerate_checklist(
    form_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Dispara novamente a task generate_checklist para o form_id informado.
    Útil para regenerar em caso de erro ou mudança nas partes.
    """
    try:
        from app.celery_client import celery_app  # lazy import para evitar circular
        celery_app.send_task("generate_checklist", args=[form_id])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao disparar task: {exc}") from exc

    return {"status": "queued", "form_id": form_id}
