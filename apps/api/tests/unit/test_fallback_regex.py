"""Testes do fallback regex (sem Groq)."""
import pytest
from app.infrastructure.ai.fallback_regex import extract_parties_regex, generate_checklist_default


def test_fallback_detects_comprador():
    text = "COMPRADOR: João Silva CPF: 123.456.789-09"
    parties = extract_parties_regex(text)
    assert len(parties["buyers"]) > 0
    assert parties["buyers"][0]["name_field"] == "COMPRADOR"


def test_fallback_detects_vendedor():
    text = "VENDEDOR: Maria Souza"
    parties = extract_parties_regex(text)
    assert len(parties["sellers"]) > 0


def test_fallback_detects_adquirente():
    text = "ADQUIRENTE: Pedro Lima"
    parties = extract_parties_regex(text)
    assert len(parties["buyers"]) > 0


def test_checklist_default_pf():
    parties = {
        "buyers": [{"index": 1, "type": "person", "name_field": "COMPRADOR"}],
        "sellers": [],
        "witnesses": [],
        "procurators": [],
        "spouses": [],
    }
    checklist = generate_checklist_default(parties)
    assert "checklist" in checklist
    items = checklist["checklist"]
    assert len(items) == 1
    doc_names = [d["name"] for d in items[0]["documents"]]
    assert "RG ou CNH" in doc_names
    assert "CPF" in doc_names
    assert "Comprovante de residência" in doc_names
