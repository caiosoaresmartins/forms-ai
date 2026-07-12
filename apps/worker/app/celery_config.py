"""Configuração Celery Beat para tasks agendadas."""
from celery.schedules import crontab

beat_schedule = {
    "cleanup-expired-forms-daily": {
        "task": "tasks.cleanup_expired_forms",
        "schedule": crontab(hour=3, minute=0),  # Diariamente às 03:00
    },
}

task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]
timezone = "America/Sao_Paulo"
enable_utc = True
worker_prefetch_multiplier = 1
task_acks_late = True
task_reject_on_worker_lost = True
result_expires = 3600
