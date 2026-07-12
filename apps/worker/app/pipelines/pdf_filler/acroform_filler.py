"""Preenchimento de campos AcroForm em PDFs nativos via pypdf."""
from __future__ import annotations
import logging
from pathlib import Path
from pypdf import PdfReader, PdfWriter

logger = logging.getLogger(__name__)


def fill_acroform(input_path: str, output_path: str, field_values: dict[str, str]) -> int:
    """
    Preenche campos AcroForm de um PDF.

    Args:
        input_path: Caminho do PDF original.
        output_path: Caminho de saída do PDF preenchido.
        field_values: Dicionário {nome_do_campo: valor}.

    Returns:
        Número de campos preenchidos.
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()
    writer.append(reader)

    filled = 0
    for page in writer.pages:
        if "/Annots" not in page:
            continue
        for annot in page["/Annots"]:
            obj = annot.get_object()
            field_name = obj.get("/T")
            if field_name and str(field_name) in field_values:
                writer.update_page_form_field_values(
                    page,
                    {str(field_name): field_values[str(field_name)]},
                )
                filled += 1
                logger.debug(f"Campo preenchido: {field_name}")

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)

    logger.info(f"AcroForm: {filled} campos preenchidos → {output_path}")
    return filled


def list_acroform_fields(pdf_path: str) -> list[str]:
    """Retorna lista de nomes de campos AcroForm disponíveis no PDF."""
    reader = PdfReader(pdf_path)
    fields = reader.get_fields() or {}
    return list(fields.keys())
