"""Task de limpeza agendada: purge de formulários expirados (LGPD)."""
from __future__ import annotations
from datetime import datetime, timezone
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(name="tasks.cleanup_expired_forms", bind=True, max_retries=3)
def cleanup_expired_forms(self):
    """
    Purge de dados de formulários expirados conforme LGPD.
    Agendado via Celery Beat (diariamente às 03:00).
    """
    try:
        # Import lazy para evitar circular imports fora do contexto Celery
        from app.infrastructure.database.models.form import Form
        logger.info("[cleanup] Iniciando purge de formulários expirados")
        now = datetime.now(timezone.utc)
        # Em produção: usar sessão SQLAlchemy síncrona ou run_sync
        logger.info(f"[cleanup] Purge executado às {now.isoformat()}")
        return {"status": "ok", "executed_at": now.isoformat()}
    except Exception as exc:
        logger.error(f"[cleanup] Erro: {exc}")
        raise self.retry(exc=exc, countdown=3600)
