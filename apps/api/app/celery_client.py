"""Cliente Celery para a API FastAPI enviar tasks ao worker."""
from celery import Celery
from app.core.config import settings

_celery_instance: Celery | None = None


def get_celery() -> Celery:
    global _celery_instance
    if _celery_instance is None:
        _celery_instance = Celery(broker=settings.redis_url, backend=settings.redis_url)
    return _celery_instance
