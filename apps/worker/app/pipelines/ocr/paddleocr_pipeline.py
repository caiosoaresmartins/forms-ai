"""Pipeline PaddleOCR: converte páginas do PDF em imagem e executa OCR."""
from __future__ import annotations
import tempfile
import os
from typing import TYPE_CHECKING

import fitz  # PyMuPDF

if TYPE_CHECKING:
    pass


def _page_to_image(page: fitz.Page, dpi: int = 150) -> bytes:
    """Renderiza uma página do PDF como PNG em memória."""
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    return pix.tobytes("png")


def run_ocr_on_pdf(pdf_path: str, lang: str = "pt") -> list[dict]:
    """
    Executa OCR página a página usando PaddleOCR.
    Retorna lista de páginas com blocos no formato:
      [{page_num, text, blocks: [{text, bbox, confidence}]}]
    """
    try:
        from paddleocr import PaddleOCR
        ocr_engine = PaddleOCR(use_angle_cls=True, lang=lang, use_gpu=False, show_log=False)
    except ImportError:
        raise RuntimeError("PaddleOCR não instalado. Execute: pip install paddleocr paddlepaddle")

    pages_result = []
    doc = fitz.open(pdf_path)

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        image_bytes = _page_to_image(page)

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        try:
            result = ocr_engine.ocr(tmp_path, cls=True)
        finally:
            os.unlink(tmp_path)

        blocks = []
        full_text_parts = []

        if result and result[0]:
            for line in result[0]:
                bbox_raw, (text, confidence) = line
                x0 = min(p[0] for p in bbox_raw)
                y0 = min(p[1] for p in bbox_raw)
                x1 = max(p[0] for p in bbox_raw)
                y1 = max(p[1] for p in bbox_raw)
                blocks.append({"text": text, "bbox": [x0, y0, x1, y1], "confidence": round(confidence, 4)})
                full_text_parts.append(text)

        pages_result.append({
            "page_num": page_idx + 1,
            "text": " ".join(full_text_parts),
            "blocks": blocks,
        })

    doc.close()
    return pages_result
