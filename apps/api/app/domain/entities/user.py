from dataclasses import dataclass, field
from uuid import UUID, uuid4
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    OPERATOR = "operator"
    VIEWER = "viewer"

@dataclass
class User:
    id: UUID = field(default_factory=uuid4)
    tenant_id: UUID = field(default_factory=uuid4)
    email: str = ""
    password_hash: str = ""
    role: UserRole = UserRole.OPERATOR
    is_active: bool = True

    def __post_init__(self):
        if not self.email or "@" not in self.email:
            raise ValueError(f"Email inválido: {self.email}")

    def deactivate(self):
        self.is_active = False

    def activate(self):
        self.is_active = True
