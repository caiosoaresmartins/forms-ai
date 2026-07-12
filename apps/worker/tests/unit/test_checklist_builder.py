"""Testes unitários para o checklist_builder (pipeline LLM)."""
from __future__ import annotations

import json
from unittest.mock import patch

import pytest

SAMPLE_PARTIES = {
    "parties": {
        "buyer": [{"name": "João Silva"}],
        "seller": [{"name": "Maria Souza"}],
    }
}

VALID_LLM_RESPONSE = json.dumps({
    "checklist": [
        {
            "party_type": "buyer",
            "party_index": 1,
            "party_name": "João Silva",
            "documents": [
                {"name": "RG ou CNH", "required": True},
                {"name": "CPF", "required": True},
                {"name": "Comprovante de residência", "required": True},
                {"name": "Certidão de estado civil", "required": True},
            ],
        }
    ]
})

INVALID_JSON_RESPONSE = "Aqui está sua checklist: {invalid json"
MISSING_KEY_RESPONSE = json.dumps({"items": []})


def test_build_checklist_retorna_estrutura_valida():
    with patch("app.pipelines.llm.checklist_builder.chat", return_value=VALID_LLM_RESPONSE):
        from app.pipelines.llm.checklist_builder import build_checklist

        result = build_checklist(SAMPLE_PARTIES)

    assert "checklist" in result
    assert isinstance(result["checklist"], list)
    assert len(result["checklist"]) > 0


def test_build_checklist_remove_markdown_code_block():
    markdown_response = f"```json\n{VALID_LLM_RESPONSE}\n```"
    with patch("app.pipelines.llm.checklist_builder.chat", return_value=markdown_response):
        from app.pipelines.llm.checklist_builder import build_checklist

        result = build_checklist(SAMPLE_PARTIES)

    assert "checklist" in result


def test_build_checklist_levanta_erro_json_invalido():
    with patch("app.pipelines.llm.checklist_builder.chat", return_value=INVALID_JSON_RESPONSE):
        from app.pipelines.llm.checklist_builder import build_checklist

        with pytest.raises(ValueError, match="JSON inválido"):
            build_checklist(SAMPLE_PARTIES)


def test_build_checklist_levanta_erro_sem_chave_checklist():
    with patch("app.pipelines.llm.checklist_builder.chat", return_value=MISSING_KEY_RESPONSE):
        from app.pipelines.llm.checklist_builder import build_checklist

        with pytest.raises(ValueError, match="sem chave 'checklist'"):
            build_checklist(SAMPLE_PARTIES)
