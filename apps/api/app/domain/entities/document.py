from dataclasses import dataclass, field
from uuid import UUID, uuid4
from enum import Enum
from datetime import datetime

ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/tiff"}
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    ERROR = "error"
    EXPIRED = "expired"

@dataclass
class Document:
    id: UUID = field(default_factory=uuid4)
    tenant_id: UUID = field(default_factory=uuid4)
    uploaded_by: UUID = field(default_factory=uuid4)
    type: str = ""
    filename: str = ""
    mime_type: str = ""
    size_bytes: int = 0
    storage_path: str = ""
    status: DocumentStatus = DocumentStatus.PENDING
    expires_at: datetime | None = None

    def __post_init__(self):
        if self.mime_type and self.mime_type not in ALLOWED_MIME_TYPES:
            raise ValueError(f"MIME type não permitido: {self.mime_type}")
        if self.size_bytes > MAX_SIZE_BYTES:
            raise ValueError(f"Arquivo excede o tamanho máximo de 50MB")

    def mark_processing(self): self.status = DocumentStatus.PROCESSING
    def mark_done(self): self.status = DocumentStatus.DONE
    def mark_error(self): self.status = DocumentStatus.ERROR
    def mark_expired(self): self.status = DocumentStatus.EXPIRED
