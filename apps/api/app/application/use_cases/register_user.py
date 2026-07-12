from dataclasses import dataclass
from uuid import UUID
from app.domain.entities.user import User, UserRole
from app.domain.repositories.user_repository import UserRepository
from app.domain.repositories.tenant_repository import TenantRepository
from app.core.security import hash_password

@dataclass
class RegisterUserInput:
    tenant_id: UUID
    email: str
    password: str
    role: UserRole = UserRole.OPERATOR

@dataclass
class RegisterUserOutput:
    user: User

class RegisterUserUseCase:
    def __init__(self, user_repo: UserRepository, tenant_repo: TenantRepository):
        self.user_repo = user_repo
        self.tenant_repo = tenant_repo

    async def execute(self, input: RegisterUserInput) -> RegisterUserOutput:
        tenant = await self.tenant_repo.get_by_id(input.tenant_id)
        if not tenant:
            raise ValueError("Tenant não encontrado")

        existing = await self.user_repo.get_by_email(input.email, input.tenant_id)
        if existing:
            raise ValueError("Email já cadastrado neste tenant")

        user = User(
            tenant_id=input.tenant_id,
            email=input.email,
            password_hash=hash_password(input.password),
            role=input.role,
        )
        created = await self.user_repo.create(user)
        return RegisterUserOutput(user=created)
