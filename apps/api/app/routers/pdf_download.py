"""
Bloco 5 — Endpoints de PDF.

GET  /forms/{form_id}/pdf/original   → download do PDF original
GET  /forms/{form_id}/pdf/filled     → download do PDF preenchido
POST /forms/{form_id}/pdf/generate   → dispara a task generate_filled_pdf
"""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/forms", tags=["pdf"])

DATA_DIR = Path("/tmp/forms")


@router.get("/{form_id}/pdf/original")
async def download_original(form_id: str):
    path = DATA_DIR / f"{form_id}_original.pdf"
    if not path.exists():
        raise HTTPException(status_code=404, detail="PDF original não encontrado")
    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=f"{form_id}_original.pdf",
    )


@router.get("/{form_id}/pdf/filled")
async def download_filled(form_id: str):
    path = DATA_DIR / f"{form_id}_filled.pdf"
    if not path.exists():
        raise HTTPException(status_code=404, detail="PDF preenchido ainda não gerado")
    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=f"{form_id}_preenchido.pdf",
    )


@router.get("/{form_id}/pdf/status")
async def pdf_status(form_id: str):
    """Verifica se o PDF preenchido já foi gerado."""
    filled_path = DATA_DIR / f"{form_id}_filled.pdf"
    result_path = DATA_DIR / f"{form_id}_fill_result.json"

    if filled_path.exists() and result_path.exists():
        with result_path.open() as f:
            meta = json.load(f)
        return {"ready": True, **meta}

    return {"ready": False, "form_id": form_id}


@router.post("/{form_id}/pdf/generate")
async def trigger_generate(form_id: str):
    """Dispara (ou redispara) a task de geração do PDF preenchido."""
    try:
        from app.celery_client import celery_app
        celery_app.send_task("tasks.generate_filled_pdf", args=[form_id])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao disparar task: {exc}") from exc
    return {"status": "queued", "form_id": form_id}
