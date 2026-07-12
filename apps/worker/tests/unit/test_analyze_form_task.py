"""Testes unitários da task analyze_form (mockando storage e OCR)."""
import json
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


def test_analyze_form_task_structure():
    """Verifica que o JSON de saída tem a estrutura correta."""
    pdf_path = _create_blank_pdf()
    try:
        with patch("app.tasks.analyze_form.extract_data") as mock_extract:
            mock_extract.delay = MagicMock()

            from app.tasks.analyze_form import analyze_form
            result = analyze_form.run("form-uuid-1", "tenant-uuid-1", pdf_path)

        assert result["form_id"] == "form-uuid-1"
        assert result["status"] == "analyzed"
        assert os.path.exists(result["output_path"])

        with open(result["output_path"]) as f:
            output = json.load(f)

        assert "form_id" in output
        assert "pages" in output
        assert "acroform_fields" in output
        assert "has_acroform" in output
        assert "total_pages" in output
    finally:
        os.unlink(pdf_path)
        output_path = f"/tmp/form_form-uuid-1_analyzed.json"
        if os.path.exists(output_path):
            os.unlink(output_path)
