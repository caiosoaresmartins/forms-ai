"""PDF Reader: detecta texto nativo e extrai campos AcroForm via pypdf."""
import pypdf
from typing import Any


def has_native_text(pdf_path: str) -> bool:
    """Retorna True se o PDF tem texto selecionável (não escaneado)."""
    with open(pdf_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for page in reader.pages:
            text = page.extract_text() or ""
            if text.strip():
                return True
    return False


def extract_text_by_page(pdf_path: str) -> list[dict]:
    """Extrai texto página a página de um PDF nativo."""
    pages = []
    with open(pdf_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages.append({
                "page_num": i + 1,
                "text": text,
                "blocks": [],
            })
    return pages


def extract_acroform_fields(pdf_path: str) -> list[dict]:
    """Extrai campos AcroForm do PDF, incluindo nome, tipo, valor e bbox."""
    fields_out = []
    with open(pdf_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        raw_fields: dict[str, Any] = reader.get_fields() or {}
        for name, field in raw_fields.items():
            field_type = field.get("/FT", "")
            if hasattr(field_type, "lstrip"):
                field_type = field_type.lstrip("/")
            value = field.get("/V", "")
            fields_out.append({
                "name": name,
                "type": str(field_type),
                "value": str(value) if value else "",
                "page": None,
                "bbox": [],
            })
    return fields_out
