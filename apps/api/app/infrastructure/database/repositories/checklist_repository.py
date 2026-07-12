"""Repositório de checklist items."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models.checklist_item import ChecklistItem


class ChecklistRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, items: list[dict]) -> list[ChecklistItem]:
        objs = [ChecklistItem(**item) for item in items]
        self._session.add_all(objs)
        await self._session.flush()
        return objs

    async def list_by_form(self, form_id: uuid.UUID) -> Sequence[ChecklistItem]:
        result = await self._session.execute(
            select(ChecklistItem)
            .where(ChecklistItem.form_id == form_id)
            .order_by(ChecklistItem.party_index)
        )
        return result.scalars().all()

    async def mark_uploaded(self, item_id: uuid.UUID) -> None:
        await self._session.execute(
            update(ChecklistItem)
            .where(ChecklistItem.id == item_id)
            .values(is_uploaded=True, uploaded_at=datetime.now(timezone.utc))
        )
