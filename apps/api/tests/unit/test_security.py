"""Testes de hashing de senha e JWT."""
import pytest
from unittest.mock import patch
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token


def test_hash_and_verify_password():
    hashed = hash_password("minha_senha_123")
    assert verify_password("minha_senha_123", hashed)
    assert not verify_password("senha_errada", hashed)


def test_hash_is_different_from_plain():
    hashed = hash_password("abc")
    assert hashed != "abc"


def test_create_and_decode_access_token():
    with patch("app.core.security.settings") as s:
        s.jwt_secret = "test-secret"
        s.jwt_algorithm = "HS256"
        s.access_token_expire_minutes = 60
        token = create_access_token("user-123", extra={"tenant_id": "tenant-456"})
        payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["tenant_id"] == "tenant-456"
    assert payload["type"] == "access"


def test_create_and_decode_refresh_token():
    with patch("app.core.security.settings") as s:
        s.jwt_secret = "test-secret"
        s.jwt_algorithm = "HS256"
        s.refresh_token_expire_days = 7
        token = create_refresh_token("user-123")
        payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["type"] == "refresh"


def test_decode_invalid_token_raises():
    from jose import JWTError
    with patch("app.core.security.settings") as s:
        s.jwt_secret = "test-secret"
        s.jwt_algorithm = "HS256"
        with pytest.raises(JWTError):
            decode_token("token.invalido.aqui")
