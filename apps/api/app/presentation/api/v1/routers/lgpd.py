"""Endpoints LGPD: exportação e exclusão de dados pessoais."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.dependencies import get_current_user
from app.core.lgpd import build_data_export, anonymize_email, anonymize_name
from app.infrastructure.database.base import get_db
from app.infrastructure.database.models.user import User
from app.infrastructure.database.models.form import Form
from app.infrastructure.database.models.audit_log import AuditLog
from datetime import datetime, timezone

router = APIRouter()


@router.get("/export")
async def export_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Art. 18 LGPD — exporta todos os dados pessoais do usuário."""
    count_result = await db.execute(
        select(func.count()).where(
            Form.created_by_id == current_user.id,
            Form.is_deleted.is_(False),
        )
    )
    forms_count = count_result.scalar() or 0
    return build_data_export(
        user_id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        forms_count=forms_count,
    )


@router.delete("/me", status_code=204)
async def delete_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Art. 18 LGPD — anonimiza dados pessoais e soft-deleta formulários."""
    # Anonimiza usuário
    current_user.email = anonymize_email(current_user.email)
    current_user.full_name = anonymize_name(current_user.full_name or "")
    current_user.hashed_password = "[REMOVED]"
    current_user.is_active = False

    # Soft-delete de formulários
    from sqlalchemy import update
    await db.execute(
        update(Form)
        .where(Form.created_by_id == current_user.id)
        .values(is_deleted=True, deleted_at=datetime.now(timezone.utc))
    )

    db.add(AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="lgpd.delete_request",
        resource_type="user",
        resource_id=str(current_user.id),
    ))
    await db.commit()
