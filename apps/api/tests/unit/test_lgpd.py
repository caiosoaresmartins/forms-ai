"""Testes dos utilitários LGPD."""
from app.core.lgpd import anonymize_email, anonymize_name, calc_form_expiry, is_expired, build_data_export
from datetime import datetime, timezone, timedelta


def test_anonymize_email_is_irreversible():
    anon = anonymize_email("joao@exemplo.com")
    assert anon.startswith("anon:")
    assert "joao" not in anon
    assert "exemplo" not in anon


def test_anonymize_email_same_input_same_output():
    """Hash deve ser determinístico."""
    assert anonymize_email("a@b.com") == anonymize_email("a@b.com")


def test_anonymize_name():
    assert anonymize_name("João Silva") == "[REMOVIDO]"


def test_calc_form_expiry_is_future():
    with __import__("unittest.mock", fromlist=["patch"]).patch("app.core.lgpd.settings") as s:
        s.data_retention_days = 90
        expiry = calc_form_expiry()
    assert expiry > datetime.now(timezone.utc)


def test_is_expired_past_date():
    past = datetime.now(timezone.utc) - timedelta(days=1)
    assert is_expired(past) is True


def test_is_expired_future_date():
    future = datetime.now(timezone.utc) + timedelta(days=1)
    assert is_expired(future) is False


def test_is_expired_none():
    assert is_expired(None) is False


def test_build_data_export_structure():
    with __import__("unittest.mock", fromlist=["patch"]).patch("app.core.lgpd.settings") as s:
        s.data_retention_days = 90
        export = build_data_export("uid-1", "a@b.com", "João", 5)
    assert export["user_id"] == "uid-1"
    assert export["email"] == "a@b.com"
    assert export["forms_processed"] == 5
    assert "export_generated_at" in export
