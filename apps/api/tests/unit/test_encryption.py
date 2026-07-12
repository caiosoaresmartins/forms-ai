"""Testes de criptografia de campos sensíveis."""
from unittest.mock import patch


def test_encrypt_decrypt_roundtrip():
    import os
    from cryptography.fernet import Fernet
    key = Fernet.generate_key().decode()
    with patch("app.core.encryption.settings") as s:
        s.encryption_key = key
        from app.core.encryption import encrypt_field, decrypt_field
        encrypted = encrypt_field("CPF: 123.456.789-09")
        assert encrypted != "CPF: 123.456.789-09"
        assert decrypt_field(encrypted) == "CPF: 123.456.789-09"


def test_encrypt_no_key_returns_plain():
    with patch("app.core.encryption.settings") as s:
        s.encryption_key = ""
        from app.core.encryption import encrypt_field
        result = encrypt_field("dado sensível")
    assert result == "dado sensível"


def test_decrypt_invalid_token_returns_value():
    from cryptography.fernet import Fernet
    key = Fernet.generate_key().decode()
    with patch("app.core.encryption.settings") as s:
        s.encryption_key = key
        from app.core.encryption import decrypt_field
        result = decrypt_field("token_invalido_xpto")
    assert result == "token_invalido_xpto"
