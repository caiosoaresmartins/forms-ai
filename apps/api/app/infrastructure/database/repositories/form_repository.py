"""Repositório de formulários — operações CRUD async."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models.form import Form


class FormRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, **kwargs) -> Form:
        form = Form(**kwargs)
        self._session.add(form)
        await self._session.flush()
        return form

    async def get_by_id(self, form_id: uuid.UUID) -> Form | None:
        result = await self._session.execute(
            select(Form).where(Form.id == form_id, Form.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def list_by_tenant(
        self,
        tenant_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[Form]:
        result = await self._session.execute(
            select(Form)
            .where(Form.tenant_id == tenant_id, Form.is_deleted.is_(False))
            .order_by(Form.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def update_status(self, form_id: uuid.UUID, status: str, **extra) -> None:
        await self._session.execute(
            update(Form)
            .where(Form.id == form_id)
            .values(status=status, **extra)
        )

    async def soft_delete(self, form_id: uuid.UUID) -> None:
        await self._session.execute(
            update(Form)
            .where(Form.id == form_id)
            .values(is_deleted=True, deleted_at=datetime.now(timezone.utc))
        )
