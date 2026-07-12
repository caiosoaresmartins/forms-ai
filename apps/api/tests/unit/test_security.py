import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_token, PasswordTooLongError

def test_hash_and_verify_password():
    hashed = hash_password("minhasenha123")
    assert verify_password("minhasenha123", hashed)
    assert not verify_password("senhaerrada", hashed)

def test_password_too_long_raises():
    with pytest.raises(PasswordTooLongError):
        hash_password("a" * 73)

def test_access_token_valid():
    token = create_access_token({"sub": "user-id", "tenant_id": "tenant-id", "role": "operator"})
    payload = decode_token(token)
    assert payload["sub"] == "user-id"
    assert payload["type"] == "access"

def test_invalid_token_raises():
    with pytest.raises(ValueError):
        decode_token("token.invalido.aqui")
