"""Testes unitários da task extract_data."""
import json
import os
import tempfile
import pytest
from app.tasks.extract_data import extract_parties_regex, CPF_PATTERN, CNPJ_PATTERN


def test_extract_cpf():
    text = "COMPRADOR: João Silva CPF: 123.456.789-09"
    cpfs = CPF_PATTERN.findall(text)
    assert "123.456.789-09" in cpfs


def test_extract_cnpj():
    text = "Empresa XPTO CNPJ: 12.345.678/0001-90"
    cnpjs = CNPJ_PATTERN.findall(text)
    assert "12.345.678/0001-90" in cnpjs


def test_extract_parties_comprador():
    text = "COMPRADOR: João Silva"
    parties = extract_parties_regex(text)
    roles = [p["role"] for p in parties]
    assert "COMPRADOR" in roles


def test_extract_parties_vendedor():
    text = "VENDEDOR: Maria Souza"
    parties = extract_parties_regex(text)
    roles = [p["role"] for p in parties]
    assert "VENDEDOR" in roles


def test_extract_data_task_with_json(tmp_path):
    form_data = {
        "form_id": "test-123",
        "pages": [
            {"page_num": 1, "text": "COMPRADOR: João Silva CPF: 123.456.789-09 email: joao@teste.com", "blocks": []}
        ],
        "acroform_fields": [],
        "has_acroform": False,
        "total_pages": 1,
    }
    json_path = str(tmp_path / "form_test.json")
    with open(json_path, "w") as f:
        json.dump(form_data, f)

    from app.tasks.extract_data import extract_data
    result = extract_data.run("test-123", "tenant-1", json_path)
    assert result["status"] == "extracted"
    assert "123.456.789-09" in result["cpfs"]
    assert "COMPRADOR" in [p["role"] for p in result["parties"]]
