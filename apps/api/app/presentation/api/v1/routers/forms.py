"""Router de formulários — inclui endpoint de análise com Celery."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter()


class AnalyzeRequest(BaseModel):
    pdf_path: str | None = None


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
    """
    Enfileira task Celery analyze_form para o form_id informado.
    No MVP aceita pdf_path local para testes sem storage.
    """
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


@router.get("/{form_id}/checklist")
async def get_checklist(form_id: str):
    return {"form_id": form_id, "checklist": []}
