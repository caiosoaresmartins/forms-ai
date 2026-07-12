"""Testes do AcroForm filler (pypdf)."""
import pytest
import json
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path


def test_list_acroform_fields_empty():
    """PDF sem campos retorna lista vazia."""
    mock_reader = MagicMock()
    mock_reader.get_fields.return_value = {}
    with patch("app.pipelines.pdf_filler.acroform_filler.PdfReader", return_value=mock_reader):
        from app.pipelines.pdf_filler.acroform_filler import list_acroform_fields
        result = list_acroform_fields("fake.pdf")
    assert result == []


def test_list_acroform_fields_with_fields():
    """PDF com campos retorna seus nomes."""
    mock_reader = MagicMock()
    mock_reader.get_fields.return_value = {"COMPRADOR": {}, "CPF": {}, "DATA": {}}
    with patch("app.pipelines.pdf_filler.acroform_filler.PdfReader", return_value=mock_reader):
        from app.pipelines.pdf_filler.acroform_filler import list_acroform_fields
        result = list_acroform_fields("fake.pdf")
    assert set(result) == {"COMPRADOR", "CPF", "DATA"}


def test_fill_acroform_writes_file(tmp_path):
    """fill_acroform deve salvar o arquivo de saída."""
    output = str(tmp_path / "output.pdf")
    mock_reader = MagicMock()
    mock_writer = MagicMock()
    mock_writer.pages = []

    with patch("app.pipelines.pdf_filler.acroform_filler.PdfReader", return_value=mock_reader), \
         patch("app.pipelines.pdf_filler.acroform_filler.PdfWriter", return_value=mock_writer):
        from app.pipelines.pdf_filler.acroform_filler import fill_acroform
        filled = fill_acroform("fake.pdf", output, {"COMPRADOR": "João"})

    mock_writer.write.assert_called_once()
    assert filled == 0  # nenhuma anotação nas páginas mockadas
