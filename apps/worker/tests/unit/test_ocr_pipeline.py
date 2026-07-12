"""Testes unitários do pipeline PaddleOCR (com mock)."""
import os
import tempfile
from unittest.mock import patch, MagicMock
import pytest
import pypdf


def _create_blank_pdf() -> str:
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=595, height=842)
    tmpfile = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    writer.write(tmpfile)
    tmpfile.close()
    return tmpfile.name


def test_ocr_pipeline_returns_correct_format():
    """Mockando PaddleOCR, verifica que blocos são retornados no formato correto."""
    pdf_path = _create_blank_pdf()
    try:
        mock_ocr_result = [[
            [[[10, 20], [100, 20], [100, 40], [10, 40]], ("COMPRADOR", 0.98)],
            [[[10, 50], [200, 50], [200, 70], [10, 70]], ("João Silva", 0.95)],
        ]]

        mock_paddle = MagicMock()
        mock_paddle.return_value.ocr.return_value = mock_ocr_result

        with patch.dict("sys.modules", {"paddleocr": MagicMock(PaddleOCR=mock_paddle)}):
            from app.pipelines.ocr.paddleocr_pipeline import run_ocr_on_pdf
            pages = run_ocr_on_pdf(pdf_path)

        assert isinstance(pages, list)
        assert len(pages) >= 1
        page = pages[0]
        assert "page_num" in page
        assert "text" in page
        assert "blocks" in page
        for block in page["blocks"]:
            assert "text" in block
            assert "bbox" in block
            assert "confidence" in block
    finally:
        os.unlink(pdf_path)
