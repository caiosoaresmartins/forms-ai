"""Testes do overlay filler (PyMuPDF)."""
import pytest
from unittest.mock import patch, MagicMock
from app.pipelines.pdf_filler.overlay_filler import TextField


def test_fill_by_overlay_counts_fields(tmp_path):
    """fill_by_overlay deve retornar o número de campos inseridos."""
    output = str(tmp_path / "output.pdf")

    mock_page = MagicMock()
    mock_doc = MagicMock()
    mock_doc.__len__ = MagicMock(return_value=1)
    mock_doc.__getitem__ = MagicMock(return_value=mock_page)

    with patch("app.pipelines.pdf_filler.overlay_filler.fitz.open", return_value=mock_doc), \
         patch("app.pipelines.pdf_filler.overlay_filler.fitz.Point") as mock_point:
        from app.pipelines.pdf_filler.overlay_filler import fill_by_overlay
        fields = [
            TextField(page=0, x=50, y=100, text="João"),
            TextField(page=0, x=50, y=120, text="123.456.789-09"),
        ]
        filled = fill_by_overlay("fake.pdf", output, fields)

    assert filled == 2
    assert mock_page.insert_text.call_count == 2


def test_fill_by_overlay_skip_invalid_page(tmp_path):
    """Campos com página inválida devem ser ignorados."""
    output = str(tmp_path / "output.pdf")

    mock_doc = MagicMock()
    mock_doc.__len__ = MagicMock(return_value=1)  # Apenas página 0

    with patch("app.pipelines.pdf_filler.overlay_filler.fitz.open", return_value=mock_doc):
        from app.pipelines.pdf_filler.overlay_filler import fill_by_overlay
        fields = [TextField(page=5, x=50, y=100, text="fora")]  # página 5 não existe
        filled = fill_by_overlay("fake.pdf", output, fields)

    assert filled == 0
