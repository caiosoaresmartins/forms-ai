"""Testes do ChecklistRepository."""
import uuid
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.infrastructure.database.base import Base
from app.infrastructure.database.models import Tenant, Form
from app.infrastructure.database.repositories.checklist_repository import ChecklistRepository
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
async def form(session):
    tenant = Tenant(name="T", slug="t", plan="free")
    session.add(tenant)
    await session.flush()
    repo = FormRepository(session)
    f = await repo.create(
        tenant_id=tenant.id,
        original_filename="f.pdf",
        storage_path="/tmp/f.pdf",
    )
    await session.commit()
    return f


@pytest.mark.asyncio
async def test_bulk_create(session, form):
    repo = ChecklistRepository(session)
    items = [
        {"form_id": form.id, "party_type": "buyer", "party_index": 1, "document_name": "RG ou CNH", "is_required": True},
        {"form_id": form.id, "party_type": "buyer", "party_index": 1, "document_name": "CPF", "is_required": True},
    ]
    created = await repo.bulk_create(items)
    await session.commit()
    assert len(created) == 2


@pytest.mark.asyncio
async def test_list_by_form(session, form):
    repo = ChecklistRepository(session)
    await repo.bulk_create([
        {"form_id": form.id, "party_type": "seller", "party_index": 1, "document_name": "CPF", "is_required": True},
    ])
    await session.commit()

    result = await repo.list_by_form(form.id)
    assert len(result) == 1
    assert result[0].document_name == "CPF"


@pytest.mark.asyncio
async def test_mark_uploaded(session, form):
    repo = ChecklistRepository(session)
    items = await repo.bulk_create([
        {"form_id": form.id, "party_type": "buyer", "party_index": 1, "document_name": "RG", "is_required": True},
    ])
    await session.commit()

    await repo.mark_uploaded(items[0].id)
    await session.commit()

    result = await repo.list_by_form(form.id)
    assert result[0].is_uploaded is True
