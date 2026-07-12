"""Testes do FormRepository usando banco em memória (SQLite async)."""
import uuid
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.infrastructure.database.base import Base
from app.infrastructure.database.models import Tenant, User, Form
from app.infrastructure.database.repositories.form_repository import FormRepository

TEST_DB = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def session():
    engine = create_async_engine(TEST_DB, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as s:
        yield s
    await engine.dispose()


@pytest_asyncio.fixture
async def tenant(session):
    t = Tenant(name="Teste", slug="teste", plan="free")
    session.add(t)
    await session.commit()
    return t


@pytest.mark.asyncio
async def test_create_and_get_form(session, tenant):
    repo = FormRepository(session)
    form = await repo.create(
        tenant_id=tenant.id,
        original_filename="contrato.pdf",
        storage_path="/tmp/contrato.pdf",
    )
    await session.commit()

    found = await repo.get_by_id(form.id)
    assert found is not None
    assert found.original_filename == "contrato.pdf"
    assert found.status == "pending"


@pytest.mark.asyncio
async def test_update_status(session, tenant):
    repo = FormRepository(session)
    form = await repo.create(
        tenant_id=tenant.id,
        original_filename="doc.pdf",
        storage_path="/tmp/doc.pdf",
    )
    await session.commit()

    await repo.update_status(form.id, "filled", fields_filled=5)
    await session.commit()

    found = await repo.get_by_id(form.id)
    assert found.status == "filled"
    assert found.fields_filled == 5


@pytest.mark.asyncio
async def test_soft_delete(session, tenant):
    repo = FormRepository(session)
    form = await repo.create(
        tenant_id=tenant.id,
        original_filename="del.pdf",
        storage_path="/tmp/del.pdf",
    )
    await session.commit()

    await repo.soft_delete(form.id)
    await session.commit()

    found = await repo.get_by_id(form.id)
    assert found is None  # soft delete → não retornado


@pytest.mark.asyncio
async def test_list_by_tenant(session, tenant):
    repo = FormRepository(session)
    for i in range(3):
        await repo.create(
            tenant_id=tenant.id,
            original_filename=f"doc{i}.pdf",
            storage_path=f"/tmp/doc{i}.pdf",
        )
    await session.commit()

    forms = await repo.list_by_tenant(tenant.id)
    assert len(forms) == 3
