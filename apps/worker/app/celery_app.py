from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "saas_form_filler",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.analyze_form",
        "app.tasks.extract_data",
        "app.tasks.generate_pdf",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/Sao_Paulo",
    enable_utc=True,
)
