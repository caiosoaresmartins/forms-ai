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

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

router = APIRouter(prefix="/forms", tags=["documents"])

DOCS_DIR = Path("/tmp/forms/docs")
DATA_DIR = Path("/tmp/forms")

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

    dest_dir = DOCS_DIR / form_id / str(party_index)
    dest_dir.mkdir(parents=True, exist_ok=True)

    file_id = uuid.uuid4().hex
    suffix = Path(file.filename or "doc").suffix or ".bin"
    dest_path = dest_dir / f"{file_id}{suffix}"
    dest_path.write_bytes(content)

    # Atualiza o índice de documentos da parte
    index_path = dest_dir / "index.json"
    index: list[dict] = []
    if index_path.exists():
        index = json.loads(index_path.read_text())

    entry = {
        "file_id": file_id,
        "original_name": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(content),
        "path": str(dest_path),
    }
    index.append(entry)
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2))

    return entry


# ---------------------------------------------------------------------------
# Listagem
# ---------------------------------------------------------------------------

@router.get("/{form_id}/parties/{party_index}/documents")
async def list_documents(form_id: str, party_index: int):
    """Lista os documentos já enviados para uma parte."""
    index_path = DOCS_DIR / form_id / str(party_index) / "index.json"
    if not index_path.exists():
        return {"documents": []}
    return {"documents": json.loads(index_path.read_text())}


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
):
    """
    Marca ou desmarca um documento da checklist como entregue.
    party_index: posição da parte no array checklist[]
    doc_index:   posição do documento no array documents[] da parte
    """
    checklist_path = DATA_DIR / f"{form_id}_checklist.json"
    if not checklist_path.exists():
        raise HTTPException(status_code=404, detail="Checklist não encontrada")

    data = json.loads(checklist_path.read_text())
    items: list[dict] = data.get("checklist", [])

    if party_index >= len(items):
        raise HTTPException(status_code=404, detail="Índice de parte fora do range")

    documents: list[dict] = items[party_index].get("documents", [])
    if doc_index >= len(documents):
        raise HTTPException(status_code=404, detail="Índice de documento fora do range")

    documents[doc_index]["uploaded"] = body.uploaded
    checklist_path.write_text(json.dumps(data, ensure_ascii=False, indent=2))

    return {
        "party_index": party_index,
        "doc_index": doc_index,
        "uploaded": body.uploaded,
    }
