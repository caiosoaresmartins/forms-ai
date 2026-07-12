"""Task Celery: extrai dados estruturados do JSON analisado via regex."""
import json
import re
from app.celery_app import celery_app

CPF_PATTERN = re.compile(r'\d{3}\.\d{3}\.\d{3}-\d{2}')
CNPJ_PATTERN = re.compile(r'\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}')
EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')

PARTY_KEYWORDS = [
    "COMPRADOR", "VENDEDOR", "ADQUIRENTE", "CEDENTE",
    "PROMITENTE", "OUTORGANTE", "OUTORGADO", "CESSIONÁRIO",
]


def extract_parties_regex(text: str) -> list[dict]:
    """Detecta partes no texto usando palavras-chave e regex."""
    parties = []
    for keyword in PARTY_KEYWORDS:
        if keyword in text.upper():
            parties.append({"role": keyword, "detected": True})
    return parties


@celery_app.task(name="tasks.extract_data", bind=True, max_retries=3)
def extract_data(self, form_id: str, tenant_id: str, form_json_path: str | None = None):
    """
    Extrai dados estruturados do JSON do analyze_form:
    - Partes detectadas (regex)
    - CPFs, CNPJs, e-mails encontrados
    """
    if not form_json_path:
        return {"form_id": form_id, "status": "skipped", "reason": "sem json"}

    with open(form_json_path, "r", encoding="utf-8") as f:
        form_data = json.load(f)

    full_text = " ".join(p["text"] for p in form_data.get("pages", []))

    cpfs = CPF_PATTERN.findall(full_text)
    cnpjs = CNPJ_PATTERN.findall(full_text)
    emails = EMAIL_PATTERN.findall(full_text)
    parties = extract_parties_regex(full_text)

    result = {
        "form_id": form_id,
        "parties": parties,
        "cpfs": list(set(cpfs)),
        "cnpjs": list(set(cnpjs)),
        "emails": list(set(emails)),
        "status": "extracted",
    }

    return result
