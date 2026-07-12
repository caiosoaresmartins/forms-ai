from app.celery_app import celery_app

@celery_app.task(name="tasks.analyze_form", bind=True, max_retries=3)
def analyze_form(self, form_id: str, tenant_id: str):
    """Analisa formulário PDF — OCR ou extração nativa"""
    # TODO: implementar no Bloco 2
    return {"form_id": form_id, "status": "pending_implementation"}
