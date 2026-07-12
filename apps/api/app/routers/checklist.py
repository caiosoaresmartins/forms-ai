"""
Endpoints de checklist.

GET  /forms/{form_id}/checklist  → retorna checklist gerada pelo LLM
POST /forms/{form_id}/checklist  → (re)dispara a task generate_checklist
"""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/forms", tags=["checklist"])

DATA_DIR = Path("/tmp/forms")


@router.get("/{form_id}/checklist")
async def get_checklist(form_id: str):
    checklist_path = DATA_DIR / f"{form_id}_checklist.json"
    if not checklist_path.exists():
        raise HTTPException(status_code=404, detail="Checklist ainda não gerada")
    with checklist_path.open() as f:
        return json.load(f)


@router.post("/{form_id}/checklist")
async def regenerate_checklist(form_id: str):
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
