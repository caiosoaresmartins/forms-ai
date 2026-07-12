"""Fallback local no worker: extração de partes e checklist padrão via regex."""
from __future__ import annotations
import logging

logger = logging.getLogger(__name__)

PARTY_MAP = {
    "buyers": ["COMPRADOR", "ADQUIRENTE", "PROPONENTE", "CESSÁRIO"],
    "sellers": ["VENDEDOR", "PROMITENTE VENDEDOR", "CEDENTE", "OUTORGANTE"],
    "witnesses": ["TESTEMUNHA"],
    "procurators": ["PROCURADOR"],
    "spouses": ["CÔNJUGE", "ESPOSO", "ESPOSA"],
}

DEFAULT_PF_DOCS = [
    {"name": "RG ou CNH", "required": True, "notes": "frente e verso"},
    {"name": "CPF", "required": True, "notes": ""},
    {"name": "Comprovante de residência", "required": True, "notes": "máximo 90 dias"},
    {"name": "Certidão de estado civil", "required": True, "notes": ""},
]


def extract_parties_regex(form_text: str) -> dict:
    logger.warning("LLM indisponível, usando extração por regex")
    upper_text = form_text.upper()
    result: dict[str, list] = {k: [] for k in PARTY_MAP}
    for party_key, keywords in PARTY_MAP.items():
        for idx, keyword in enumerate(keywords):
            if keyword in upper_text:
                result[party_key].append({"index": idx + 1, "type": "person", "name_field": keyword})
                break
    return result


def generate_checklist_default(parties: dict) -> dict:
    checklist = []
    for party_type, party_list in parties.items():
        for party in party_list:
            checklist.append({
                "party_type": party_type.rstrip("s"),
                "party_index": party.get("index", 1),
                "party_name": party.get("name_field", ""),
                "documents": DEFAULT_PF_DOCS.copy(),
            })
    return {"checklist": checklist}
