"""Preenchimento por overlay de texto em PDFs não-nativos (sem AcroForm) via PyMuPDF."""
from __future__ import annotations
import logging
from pathlib import Path
from dataclasses import dataclass, field
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


@dataclass
class TextField:
    """Representa um campo de texto a ser inserido no PDF."""
    page: int
    x: float
    y: float
    text: str
    font_size: float = 10.0
    font_name: str = "helv"
    color: tuple = (0.0, 0.0, 0.0)


def fill_by_overlay(
    input_path: str,
    output_path: str,
    text_fields: list[TextField],
) -> int:
    """
    Insere textos nas coordenadas especificadas em cada página do PDF.

    Args:
        input_path: Caminho do PDF original.
        output_path: Caminho de saída.
        text_fields: Lista de campos com posição e conteúdo.

    Returns:
        Número de campos inseridos.
    """
    doc = fitz.open(input_path)
    filled = 0

    for tf in text_fields:
        if tf.page >= len(doc):
            logger.warning(f"Página {tf.page} não existe no PDF (total: {len(doc)})")
            continue
        page = doc[tf.page]
        point = fitz.Point(tf.x, tf.y)
        page.insert_text(
            point,
            tf.text,
            fontsize=tf.font_size,
            fontname=tf.font_name,
            color=tf.color,
        )
        filled += 1
        logger.debug(f"Overlay inserido: '{tf.text}' em ({tf.x},{tf.y}) p.{tf.page}")

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)
    doc.close()

    logger.info(f"Overlay: {filled} campos inseridos → {output_path}")
    return filled
