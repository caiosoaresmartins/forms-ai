"""Modelo Form — formulário PDF processado."""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Integer, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.base import Base


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Arquivo
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    filled_storage_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Pipeline
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False, index=True
    )
    ocr_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fill_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fields_filled: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Dados extraídos (JSONB para queries)
    extracted_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    parties_detected: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Retenção LGPD
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    tenant: Mapped["Tenant"] = relationship(back_populates="forms")
    created_by: Mapped["User | None"] = relationship(back_populates="forms")
    checklist_items: Mapped[list["ChecklistItem"]] = relationship(
        back_populates="form", cascade="all, delete-orphan", lazy="selectin"
    )
