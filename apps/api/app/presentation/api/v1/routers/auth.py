"""Router de autenticação: register, login, refresh, me, logout."""
from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user
from app.infrastructure.database.base import get_db
from app.infrastructure.database.models.user import User
from app.infrastructure.database.models.tenant import Tenant
from app.infrastructure.database.models.audit_log import AuditLog
from jose import JWTError

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    tenant_name: str
    tenant_slug: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Cria tenant + usuário admin."""
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    slug_check = await db.execute(select(Tenant).where(Tenant.slug == body.tenant_slug))
    if slug_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug de tenant já em uso")

    tenant = Tenant(name=body.tenant_name, slug=body.tenant_slug)
    db.add(tenant)
    await db.flush()

    user = User(
        tenant_id=tenant.id,
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role="admin",
    )
    db.add(user)
    await db.flush()

    db.add(AuditLog(
        tenant_id=tenant.id, user_id=user.id,
        action="user.register", resource_type="user", resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
    ))
    await db.commit()
    return {"user_id": str(user.id), "tenant_id": str(tenant.id)}


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    user.last_login_at = datetime.now(timezone.utc)
    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id,
        action="user.login", resource_type="user", resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
    ))
    await db.commit()
    return TokenResponse(
        access_token=create_access_token(str(user.id), extra={"tenant_id": str(user.tenant_id)}),
        refresh_token=create_refresh_token(str(user.id)),
    )


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError
        user_id = payload["sub"]
    except (JWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    result = await db.execute(select(User).where(User.id == user_id, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    return TokenResponse(
        access_token=create_access_token(str(user.id), extra={"tenant_id": str(user.tenant_id)}),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "tenant_id": str(current_user.tenant_id),
    }
