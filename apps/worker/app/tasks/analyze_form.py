"""Task Celery: analisa formulário PDF via OCR ou extração nativa."""
import json
import os
from app.celery_app import celery_app
from app.pipelines.ocr.pdf_reader import has_native_text, extract_text_by_page, extract_acroform_fields


@celery_app.task(name="tasks.analyze_form", bind=True, max_retries=3)
def analyze_form(self, form_id: str, tenant_id: str, pdf_path: str | None = None):
    """
    Fluxo:
    1. Baixar PDF do storage (usa pdf_path local no MVP)
    2. Detectar tipo: nativo ou escaneado
    3. Extrair texto + campos AcroForm (ou OCR)
    4. Salvar JSON estruturado
    5. Enfileirar próximo job: extract_data
    """
    if not pdf_path or not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF não encontrado: {pdf_path}")

    native = has_native_text(pdf_path)
    acroform_fields = extract_acroform_fields(pdf_path)

    if native:
        pages = extract_text_by_page(pdf_path)
    else:
        try:
            from app.pipelines.ocr.paddleocr_pipeline import run_ocr_on_pdf
            pages = run_ocr_on_pdf(pdf_path)
        except RuntimeError:
            pages = extract_text_by_page(pdf_path)

    result = {
        "form_id": form_id,
        "pages": pages,
        "acroform_fields": acroform_fields,
        "has_acroform": len(acroform_fields) > 0,
        "total_pages": len(pages),
    }

    import sys
    sys.path.insert(0, "/app")
    from app.infrastructure.storage.s3_client import S3Storage
    s3 = S3Storage()

    output_object = f"docs/form_{form_id}_analyzed.json"
    s3.upload_json(result, output_object)

    from app.tasks.extract_data import extract_data
    extract_data.delay(form_id, tenant_id, output_object)

    return {"form_id": form_id, "status": "analyzed", "output_object": output_object}
