import pytest
from app.domain.entities.tenant import Tenant, TenantPlan

def test_create_tenant():
    t = Tenant(name="Empresa X", slug="empresa-x")
    assert t.plan == TenantPlan.FREE
    assert t.is_active

def test_invalid_slug_raises():
    with pytest.raises(ValueError):
        Tenant(name="Empresa X", slug="Empresa X!!")

def test_upgrade_plan():
    t = Tenant(name="Empresa X", slug="empresa-x")
    t.upgrade_plan(TenantPlan.PRO)
    assert t.plan == TenantPlan.PRO
