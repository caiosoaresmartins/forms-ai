"""Testes unitários para a task generate_checklist."""
from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

SAMPLE_PARTIES = {
    "parties": {
        "buyer": [{"name": "João Silva", "cpf": "123.456.789-00"}],
        "seller": [{"name": "Maria Souza", "cpf": "987.654.321-00"}],
    }
}

SAMPLE_CHECKLIST = {
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
        },
        {
            "party_type": "seller",
            "party_index": 1,
            "party_name": "Maria Souza",
            "documents": [
                {"name": "RG ou CNH", "required": True},
                {"name": "CPF", "required": True},
                {"name": "Matrícula do imóvel", "required": True},
                {"name": "Certidão de ônus reais", "required": True},
            ],
        },
    ]
}


@pytest.fixture()
def parties_file(tmp_path: Path) -> Path:
    path = tmp_path / "abc123_parties.json"
    path.write_text(json.dumps(SAMPLE_PARTIES))
    return path


def test_generate_checklist_salva_arquivo(parties_file: Path, tmp_path: Path):
    with (
        patch("app.tasks.generate_checklist.DATA_DIR", tmp_path),
        patch("app.tasks.generate_checklist.build_checklist", return_value=SAMPLE_CHECKLIST),
    ):
        from app.tasks.generate_checklist import generate_checklist

        task = MagicMock()
        task.request.retries = 0
        result = generate_checklist.__wrapped__(task, "abc123")

    checklist_path = tmp_path / "abc123_checklist.json"
    assert checklist_path.exists(), "Arquivo de checklist não foi criado"
    saved = json.loads(checklist_path.read_text())
    assert saved == SAMPLE_CHECKLIST
    assert result == SAMPLE_CHECKLIST


def test_generate_checklist_retorna_estrutura_correta(parties_file: Path, tmp_path: Path):
    with (
        patch("app.tasks.generate_checklist.DATA_DIR", tmp_path),
        patch("app.tasks.generate_checklist.build_checklist", return_value=SAMPLE_CHECKLIST),
    ):
        from app.tasks.generate_checklist import generate_checklist

        task = MagicMock()
        task.request.retries = 0
        result = generate_checklist.__wrapped__(task, "abc123")

    assert "checklist" in result
    assert len(result["checklist"]) == 2
    assert result["checklist"][0]["party_type"] == "buyer"
    assert len(result["checklist"][0]["documents"]) >= 4


def test_generate_checklist_falha_sem_arquivo_de_partes(tmp_path: Path):
    with patch("app.tasks.generate_checklist.DATA_DIR", tmp_path):
        from app.tasks.generate_checklist import generate_checklist

        task = MagicMock()
        task.request.retries = 0

        with pytest.raises(FileNotFoundError):
            generate_checklist.__wrapped__(task, "nao_existe")
