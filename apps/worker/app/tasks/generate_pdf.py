"""
Bloco 5 — Task Celery: gera PDF final preenchido.

Fluxo:
  1. Lê o PDF original e o JSON de dados extraídos
  2. Tenta preencher via AcroForm (pypdf)
  3. Se não houver campos AcroForm, usa overlay de texto (PyMuPDF)
  4. Salva o PDF gerado em /tmp/forms/{form_id}_filled.pdf
  5. Retorna metadados do arquivo gerado
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from app.celery_app import celery_app

logger = logging.getLogger(__name__)

DATA_DIR = Path("/tmp/forms")


@celery_app.task(name="tasks.generate_filled_pdf", bind=True, max_retries=3, default_retry_delay=10)
def generate_filled_pdf(self, form_id: str, tenant_id: str = "") -> dict:
    """
    Gera o PDF final preenchido para o form_id informado.

    Espera encontrar:
      - {form_id}_original.pdf   → PDF original
      - {form_id}_extracted.json → dados extraídos pelo LLM

    Gera:
      - {form_id}_filled.pdf
    """
    logger.info("[generate_filled_pdf] form_id=%s", form_id)

    pdf_path = DATA_DIR / f"{form_id}_original.pdf"
    data_path = DATA_DIR / f"{form_id}_extracted.json"
    output_path = DATA_DIR / f"{form_id}_filled.pdf"

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF original não encontrado: {pdf_path}")
    if not data_path.exists():
        raise FileNotFoundError(f"JSON de dados não encontrado: {data_path}")

    with data_path.open() as f:
        fill_data: dict = json.load(f)

    try:
        method, fields_filled = _fill_pdf(
            str(pdf_path), str(output_path), fill_data
        )
    except Exception as exc:
        logger.warning("[generate_filled_pdf] falhou (tentativa %s): %s", self.request.retries, exc)
        raise self.retry(exc=exc)

    result = {
        "form_id": form_id,
        "tenant_id": tenant_id,
        "output_path": str(output_path),
        "method": method,
        "fields_filled": fields_filled,
        "status": "filled",
    }

    meta_path = DATA_DIR / f"{form_id}_fill_result.json"
    with meta_path.open("w") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    logger.info("[generate_filled_pdf] concluído: method=%s fields=%s", method, fields_filled)
    return result


def _fill_pdf(pdf_input: str, output: str, fill_data: dict) -> tuple[str, int]:
    """
    Tenta AcroForm primeiro; cai para overlay se não houver campos.
    Retorna (método_usado, quantidade_de_campos_preenchidos).
    """
    try:
        from app.pipelines.pdf_filler.acroform_filler import list_acroform_fields, fill_acroform
        from app.pipelines.pdf_filler.field_mapper import map_fields

        available = list_acroform_fields(pdf_input)
        if available:
            mapped = map_fields(available, fill_data)
            if mapped:
                n = fill_acroform(pdf_input, output, mapped)
                return "acroform", n
            logger.warning("[_fill_pdf] AcroForm disponível mas nenhum campo mapeado")
    except ImportError:
        logger.warning("[_fill_pdf] pipeline acroform não disponível, usando overlay")

    # fallback: overlay posicional
    return "overlay", _overlay(pdf_input, output, fill_data)


def _overlay(pdf_input: str, output: str, fill_data: dict) -> int:
    """Escreve os dados como texto sobreposto na primeira página."""
    from app.pipelines.pdf_filler.overlay_filler import fill_by_overlay, TextField

    fields = []
    y = 50.0
    for key, value in fill_data.items():
        if isinstance(value, (str, int, float)):
            fields.append(TextField(page=0, x=50.0, y=y, text=f"{key}: {value}", font_size=10))
            y += 20.0

    return fill_by_overlay(pdf_input, output, fields)
