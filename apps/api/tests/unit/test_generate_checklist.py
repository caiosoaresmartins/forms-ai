"""Testes de geração de checklist para PF e PJ."""
import pytest
from app.infrastructure.ai.fallback_regex import generate_checklist_default


def test_checklist_pf_tem_rg_cpf_comprovante():
    parties = {
        "buyers": [{"index": 1, "type": "person", "name_field": "COMPRADOR"}],
        "sellers": [{"index": 1, "type": "person", "name_field": "VENDEDOR"}],
        "witnesses": [], "procurators": [], "spouses": [],
    }
    result = generate_checklist_default(parties)
    assert len(result["checklist"]) == 2
    for item in result["checklist"]:
        nomes = [d["name"] for d in item["documents"]]
        assert "RG ou CNH" in nomes
        assert "CPF" in nomes


def test_checklist_vazio_sem_partes():
    parties = {"buyers": [], "sellers": [], "witnesses": [], "procurators": [], "spouses": []}
    result = generate_checklist_default(parties)
    assert result["checklist"] == []


def test_checklist_party_type_correto():
    parties = {
        "buyers": [{"index": 1, "type": "person", "name_field": "COMPRADOR"}],
        "sellers": [], "witnesses": [], "procurators": [], "spouses": [],
    }
    result = generate_checklist_default(parties)
    assert result["checklist"][0]["party_type"] == "buyer"
