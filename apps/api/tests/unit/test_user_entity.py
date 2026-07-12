import pytest
from app.domain.entities.user import User, UserRole

def test_create_user():
    user = User(email="joao@empresa.com", password_hash="hash")
    assert user.is_active
    assert user.role == UserRole.OPERATOR

def test_invalid_email_raises():
    with pytest.raises(ValueError):
        User(email="emailinvalido", password_hash="hash")

def test_deactivate_user():
    user = User(email="joao@empresa.com", password_hash="hash")
    user.deactivate()
    assert not user.is_active
