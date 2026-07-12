"""
Bloco 4 — Upload de documentos por parte e marcação de itens da checklist.

Endpoints:
  POST /forms/{form_id}/parties/{party_index}/documents
       Faz upload de um documento (PDF/imagem) para uma parte específica.

  GET  /forms/{form_id}/parties/{party_index}/documents
       Lista os documentos já enviados para a parte.

  PATCH /forms/{form_id}/checklist/{party_index}/{doc_index}
        Marca/desmarca um item da checklist como entregue.
"""
from __future__ import annotations

import json
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.infrastructure.database.models.user import User
from app.infrastructure.storage.s3_client import S3Storage

router = APIRouter(prefix="/forms", tags=["documents"])

s3 = S3Storage()

ALLOWED_MIME = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/tiff",
}

MAX_SIZE_MB = 20
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

@router.post("/{form_id}/parties/{party_index}/documents", status_code=201)
async def upload_document(
    form_id: str,
    party_index: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Faz upload de um documento para a parte identificada por party_index.
    Retorna metadados do arquivo salvo.
    """
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Tipo de arquivo não permitido: {file.content_type}. Use PDF ou imagem.",
        )

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo maior que {MAX_SIZE_MB} MB.",
        )

    file_id = uuid.uuid4().hex
    suffix = Path(file.filename or "doc").suffix or ".bin"
    object_name = f"docs/{form_id}/{party_index}/{file_id}{suffix}"
    
    s3.upload_file_bytes(content, object_name, file.content_type)

    # Atualiza o índice de documentos da parte no S3
    index_object = f"docs/{form_id}/{party_index}/index.json"
    index: list[dict] = []
    if s3.exists(index_object):
        index = s3.download_json(index_object)

    entry = {
        "file_id": file_id,
        "original_name": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(content),
        "path": object_name,
        "url": s3.get_presigned_url(object_name)
    }
    index.append(entry)
    s3.upload_json(index, index_object)

    return entry


# ---------------------------------------------------------------------------
# Listagem
# ---------------------------------------------------------------------------

@router.get("/{form_id}/parties/{party_index}/documents")
async def list_documents(
    form_id: str, 
    party_index: int,
    current_user: User = Depends(get_current_user),
):
    """Lista os documentos já enviados para uma parte."""
    index_object = f"docs/{form_id}/{party_index}/index.json"
    if not s3.exists(index_object):
        return {"documents": []}
    return {"documents": s3.download_json(index_object)}


# ---------------------------------------------------------------------------
# Marcar item da checklist como entregue
# ---------------------------------------------------------------------------

class ChecklistItemUpdate(BaseModel):
    uploaded: bool


@router.patch("/{form_id}/checklist/{party_index}/{doc_index}")
async def update_checklist_item(
    form_id: str,
    party_index: int,
    doc_index: int,
    body: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Marca ou desmarca um documento da checklist como entregue.
    party_index: posição da parte no array checklist[]
    doc_index:   posição do documento no array documents[] da parte
    """
    checklist_object = f"checklists/{form_id}_checklist.json"
    if not s3.exists(checklist_object):
        raise HTTPException(status_code=404, detail="Checklist não encontrada")

    data = s3.download_json(checklist_object)
    items: list[dict] = data.get("checklist", [])

    if party_index >= len(items):
        raise HTTPException(status_code=404, detail="Índice de parte fora do range")

    documents: list[dict] = items[party_index].get("documents", [])
    if doc_index >= len(documents):
        raise HTTPException(status_code=404, detail="Índice de documento fora do range")

    documents[doc_index]["uploaded"] = body.uploaded
    s3.upload_json(data, checklist_object)

    return {
        "party_index": party_index,
        "doc_index": doc_index,
        "uploaded": body.uploaded,
    }
