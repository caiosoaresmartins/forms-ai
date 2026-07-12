from dataclasses import dataclass, field
from uuid import UUID, uuid4
from enum import Enum
import re

class TenantPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

@dataclass
class Tenant:
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    slug: str = ""
    plan: TenantPlan = TenantPlan.FREE
    is_active: bool = True

    def __post_init__(self):
        if not re.match(r'^[a-z0-9-]+$', self.slug):
            raise ValueError(f"Slug inválido: {self.slug}. Use apenas letras minúsculas, números e hífens.")

    def upgrade_plan(self, new_plan: TenantPlan):
        self.plan = new_plan
