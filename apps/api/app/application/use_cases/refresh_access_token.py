from dataclasses import dataclass
from app.domain.repositories.user_repository import UserRepository
from app.core.security import decode_token, create_access_token
from uuid import UUID

@dataclass
class RefreshAccessTokenOutput:
    access_token: str
    token_type: str = "bearer"

class RefreshAccessTokenUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def execute(self, refresh_token: str) -> RefreshAccessTokenOutput:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Token inválido: tipo incorreto")

        user_id = UUID(payload["sub"])
        tenant_id = UUID(payload["tenant_id"])
        user = await self.user_repo.get_by_id(user_id, tenant_id)
        if not user or not user.is_active:
            raise ValueError("Usuário não encontrado ou inativo")

        new_payload = {"sub": str(user.id), "tenant_id": str(user.tenant_id), "role": user.role}
        return RefreshAccessTokenOutput(access_token=create_access_token(new_payload))
