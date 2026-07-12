from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()

class RegisterRequest(BaseModel):
    tenant_id: UUID
    email: str
    password: str

class LoginRequest(BaseModel):
    tenant_id: UUID
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register")
async def register(body: RegisterRequest):
    # TODO: injetar use case
    return {"message": "register endpoint — WIP"}

@router.post("/login")
async def login(body: LoginRequest):
    # TODO: injetar use case
    return {"message": "login endpoint — WIP"}

@router.post("/refresh")
async def refresh(body: RefreshRequest):
    # TODO: injetar use case
    return {"message": "refresh endpoint — WIP"}

@router.get("/me")
async def me():
    return {"message": "me endpoint — WIP"}
