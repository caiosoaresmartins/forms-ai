"""Criptografia de campos sensíveis em repouso (Fernet AES-128-CBC)."""
from __future__ import annotations
import base64
from cryptography.fernet import Fernet, InvalidToken
from app.core.config import settings


def _get_fernet() -> Fernet | None:
    key = settings.encryption_key
    if not key:
        return None
    # Aceita chave raw (32 bytes base64url) ou Fernet key
    if len(key) == 32:
        key = base64.urlsafe_b64encode(key.encode())
    return Fernet(key)


def encrypt_field(value: str) -> str:
    """Criptografa string. Retorna o valor original se chave não configurada."""
    f = _get_fernet()
    if f is None:
        return value
    return f.encrypt(value.encode()).decode()


def decrypt_field(value: str) -> str:
    """Descriptografa string. Retorna o valor original se chave não configurada."""
    f = _get_fernet()
    if f is None:
        return value
    try:
        return f.decrypt(value.encode()).decode()
    except InvalidToken:
        return value
