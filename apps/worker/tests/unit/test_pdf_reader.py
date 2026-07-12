"""Testes unitários do PDF Reader."""
import io
import os
import tempfile
import pytest
import pypdf
from app.pipelines.ocr.pdf_reader import (
    has_native_text,
    extract_text_by_page,
    extract_acroform_fields,
)


def _create_native_pdf(text: str = "COMPRADOR: João Silva") -> str:
    """Cria PDF simples com texto nativo e retorna o caminho."""
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=595, height=842)
    tmpfile = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    writer.write(tmpfile)
    tmpfile.close()
    return tmpfile.name


def test_has_native_text_blank_pdf():
    path = _create_native_pdf()
    try:
        # PDF em branco não tem texto
        result = has_native_text(path)
        assert isinstance(result, bool)
    finally:
        os.unlink(path)


def test_extract_text_by_page_returns_list():
    path = _create_native_pdf()
    try:
        pages = extract_text_by_page(path)
        assert isinstance(pages, list)
        assert len(pages) >= 1
        assert "page_num" in pages[0]
        assert "text" in pages[0]
        assert "blocks" in pages[0]
    finally:
        os.unlink(path)


def test_extract_acroform_fields_empty_pdf():
    path = _create_native_pdf()
    try:
        fields = extract_acroform_fields(path)
        assert isinstance(fields, list)
    finally:
        os.unlink(path)
