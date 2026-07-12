"""Router de formulários — análise, partes, checklist e preenchimento."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class AnalyzeRequest(BaseModel):
    pdf_path: str | None = None


class FillRequest(BaseModel):
    pdf_path: str
    fill_data: dict[str, str]


@router.post("/upload")
async def upload_form():
    return {"message": "upload form — WIP"}


@router.get("/")
async def list_forms():
    return {"message": "list forms — WIP"}


@router.get("/{form_id}")
async def get_form(form_id: str):
    return {"form_id": form_id, "status": "pending"}


@router.post("/{form_id}/analyze")
async def analyze_form_endpoint(form_id: str, body: AnalyzeRequest):
    """Enfileira task Celery analyze_form."""
    try:
        from app.celery_client import get_celery
        celery = get_celery()
        task = celery.send_task(
            "tasks.analyze_form",
            args=[form_id, "tenant-placeholder"],
            kwargs={"pdf_path": body.pdf_path},
        )
        return {"job_id": task.id, "status": "analyzing"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{form_id}/status")
async def get_form_status(form_id: str):
    return {"form_id": form_id, "status": "pending"}


@router.get("/{form_id}/parties")
async def get_parties(form_id: str):
    """Retorna as partes detectadas pelo LLM."""
    import os, json
    path = f"/tmp/form_{form_id}_checklist.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Partes ainda não processadas")
    with open(path) as f:
        data = json.load(f)
    return {"form_id": form_id, "parties": data.get("parties_detected", {})}


@router.get("/{form_id}/checklist")
async def get_checklist(form_id: str):
    """Retorna a checklist de documentos necessários."""
    import os, json
    path = f"/tmp/form_{form_id}_checklist.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Checklist ainda não gerada")
    with open(path) as f:
        data = json.load(f)
    return {"form_id": form_id, "checklist": data.get("checklist", {})}


@router.post("/{form_id}/fill")
async def fill_form_endpoint(form_id: str, body: FillRequest):
    """Enfileira task Celery fill_form para preenchimento do PDF."""
    try:
        from app.celery_client import get_celery
        celery = get_celery()
        task = celery.send_task(
            "tasks.fill_form",
            args=[form_id, "tenant-placeholder", body.pdf_path, body.fill_data],
        )
        return {"job_id": task.id, "status": "filling"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{form_id}/download")
async def download_filled_pdf(form_id: str):
    """Retorna o PDF preenchido para download."""
    import os
    from fastapi.responses import FileResponse
    path = f"/tmp/form_{form_id}_filled.pdf"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="PDF preenchido não encontrado")
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=f"form_{form_id}_filled.pdf",
    )
