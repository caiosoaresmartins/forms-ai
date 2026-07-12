"""Testes unitários para a task generate_filled_pdf."""
from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

SAMPLE_DATA = {
  "VENDEDOR": "Maria Souza",
  "CPF_VENDEDOR": "987.654.321-00",
  "COMPRADOR": "João Silva",
  "CPF_COMPRADOR": "123.456.789-00",
}


@pytest.fixture()
def setup_files(tmp_path: Path):
    """Cria PDF fake e JSON de dados no diretório temporário."""
    pdf = tmp_path / "form_abc_original.pdf"
    pdf.write_bytes(b"%PDF-1.4 fake")
    data_file = tmp_path / "form_abc_extracted.json"
    data_file.write_text(json.dumps(SAMPLE_DATA))
    return tmp_path


def test_generate_pdf_acroform(setup_files: Path):
    with (
        patch("app.tasks.generate_pdf.DATA_DIR", setup_files),
        patch("app.tasks.generate_pdf._fill_pdf", return_value=("acroform", 4)),
    ):
        from app.tasks.generate_pdf import generate_filled_pdf
        task = MagicMock()
        task.request.retries = 0
        result = generate_filled_pdf.__wrapped__(task, "form_abc")

    assert result["status"] == "filled"
    assert result["method"] == "acroform"
    assert result["fields_filled"] == 4
    assert (setup_files / "form_abc_fill_result.json").exists()


def test_generate_pdf_overlay_fallback(setup_files: Path):
    with (
        patch("app.tasks.generate_pdf.DATA_DIR", setup_files),
        patch("app.tasks.generate_pdf._fill_pdf", return_value=("overlay", 2)),
    ):
        from app.tasks.generate_pdf import generate_filled_pdf
        task = MagicMock()
        task.request.retries = 0
        result = generate_filled_pdf.__wrapped__(task, "form_abc")

    assert result["method"] == "overlay"


def test_generate_pdf_falha_sem_original(tmp_path: Path):
    with patch("app.tasks.generate_pdf.DATA_DIR", tmp_path):
        from app.tasks.generate_pdf import generate_filled_pdf
        task = MagicMock()
        task.request.retries = 0
        with pytest.raises(FileNotFoundError):
            generate_filled_pdf.__wrapped__(task, "nao_existe")


def test_generate_pdf_salva_meta_json(setup_files: Path):
    with (
        patch("app.tasks.generate_pdf.DATA_DIR", setup_files),
        patch("app.tasks.generate_pdf._fill_pdf", return_value=("acroform", 3)),
    ):
        from app.tasks.generate_pdf import generate_filled_pdf
        task = MagicMock()
        task.request.retries = 0
        generate_filled_pdf.__wrapped__(task, "form_abc")

    meta = json.loads((setup_files / "form_abc_fill_result.json").read_text())
    assert meta["form_id"] == "form_abc"
    assert meta["status"] == "filled"
