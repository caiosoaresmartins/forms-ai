from app.celery_app import celery_app

@celery_app.task(name="tasks.generate_filled_pdf", bind=True, max_retries=3)
def generate_filled_pdf(self, form_run_id: str, tenant_id: str, field_mappings: dict):
    """Gera PDF preenchido com os dados fornecidos"""
    # TODO: implementar no Bloco 4
    return {"form_run_id": form_run_id, "status": "pending_implementation"}
