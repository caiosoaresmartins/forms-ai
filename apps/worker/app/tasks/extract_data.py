from app.celery_app import celery_app

@celery_app.task(name="tasks.extract_data", bind=True, max_retries=3)
def extract_data(self, form_id: str, tenant_id: str):
    """Extrai dados estruturados do formulário analisado"""
    # TODO: implementar no Bloco 2
    return {"form_id": form_id, "status": "pending_implementation"}
