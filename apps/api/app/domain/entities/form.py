from dataclasses import dataclass, field
from uuid import UUID, uuid4
from enum import Enum

class FormStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    ERROR = "error"

@dataclass
class Form:
    id: UUID = field(default_factory=uuid4)
    tenant_id: UUID = field(default_factory=uuid4)
    name: str = ""
    version: int = 1
    status: FormStatus = FormStatus.PENDING
    storage_path: str = ""
    field_schema: dict = field(default_factory=dict)
    checklist_rules: dict = field(default_factory=dict)
    created_by: UUID | None = None

    def start_analysis(self): self.status = FormStatus.ANALYZING
    def complete_analysis(self): self.status = FormStatus.ANALYZED
    def mark_error(self): self.status = FormStatus.ERROR
