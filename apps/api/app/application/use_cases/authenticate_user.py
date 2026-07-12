from dataclasses import dataclass
from uuid import UUID
from app.domain.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token, create_refresh_token

@dataclass
class AuthenticateUserInput:
    tenant_id: UUID
    email: str
    password: str

@dataclass
class AuthenticateUserOutput:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class AuthenticateUserUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def execute(self, input: AuthenticateUserInput) -> AuthenticateUserOutput:
        user = await self.user_repo.get_by_email(input.email, input.tenant_id)
        if not user:
            raise ValueError("Credenciais inválidas")
        if not user.is_active:
            raise ValueError("Usuário inativo")
        if not verify_password(input.password, user.password_hash):
            raise ValueError("Credenciais inválidas")

        payload = {"sub": str(user.id), "tenant_id": str(user.tenant_id), "role": user.role}
        return AuthenticateUserOutput(
            access_token=create_access_token(payload),
            refresh_token=create_refresh_token(payload),
        )
