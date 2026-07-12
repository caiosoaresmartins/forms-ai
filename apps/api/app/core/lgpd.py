"""Utilitários LGPD: anonimização, cálculo de expiração e purge de dados."""
from __future__ import annotations
import hashlib
from datetime import datetime, timedelta, timezone
from app.core.config import settings


def anonymize_email(email: str) -> str:
    """Substitui e-mail por hash SHA-256 irreversível."""
    return "anon:" + hashlib.sha256(email.encode()).hexdigest()[:16]


def anonymize_name(name: str) -> str:
    return "[REMOVIDO]"


def calc_form_expiry() -> datetime:
    """Retorna a data de expiração de um formulário conforme retenção configurada."""
    return datetime.now(timezone.utc) + timedelta(days=settings.data_retention_days)


def is_expired(expires_at: datetime | None) -> bool:
    if expires_at is None:
        return False
    return datetime.now(timezone.utc) > expires_at


def build_data_export(user_id: str, email: str, full_name: str | None, forms_count: int) -> dict:
    """Monta o pacote de exportação de dados pessoais (Art. 18 LGPD)."""
    return {
        "user_id": user_id,
        "email": email,
        "full_name": full_name,
        "forms_processed": forms_count,
        "export_generated_at": datetime.now(timezone.utc).isoformat(),
        "retention_days": settings.data_retention_days,
    }
