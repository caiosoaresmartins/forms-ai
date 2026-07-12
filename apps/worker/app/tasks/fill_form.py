"""Task Celery: preenche o PDF com os dados extraídos."""
from __future__ import annotations
import json
import logging
from pathlib import Path
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.fill_form", bind=True, max_retries=3)
def fill_form(self, form_id: str, tenant_id: str, pdf_input_path: str, fill_data: dict):
    """
    Tenta preencher o PDF via AcroForm (pypdf).
    Se o PDF não tiver campos AcroForm, usa overlay de texto (PyMuPDF).

    Args:
        form_id: ID do formulário.
        tenant_id: ID do tenant.
        pdf_input_path: Caminho do PDF original.
        fill_data: Dicionário com os dados a preencher.

    Returns:
        dict com output_path, method e campos preenchidos.
    """
    output_path = f"/tmp/form_{form_id}_filled.pdf"

    try:
        from app.pipelines.pdf_filler.acroform_filler import list_acroform_fields, fill_acroform
        from app.pipelines.pdf_filler.field_mapper import map_fields

        available_fields = list_acroform_fields(pdf_input_path)

        if available_fields:
            mapped = map_fields(available_fields, fill_data)
            if mapped:
                filled = fill_acroform(pdf_input_path, output_path, mapped)
                method = "acroform"
                logger.info(f"[{form_id}] AcroForm: {filled} campos preenchidos")
            else:
                logger.warning(f"[{form_id}] AcroForm disponível mas nenhum campo mapeado, usando overlay")
                filled = _overlay_fallback(pdf_input_path, output_path, fill_data)
                method = "overlay"
        else:
            logger.info(f"[{form_id}] Sem AcroForm detectado, usando overlay")
            filled = _overlay_fallback(pdf_input_path, output_path, fill_data)
            method = "overlay"

    except Exception as e:
        logger.error(f"[{form_id}] Erro no preenchimento: {e}")
        raise self.retry(exc=e, countdown=5)

    result = {
        "form_id": form_id,
        "tenant_id": tenant_id,
        "output_path": output_path,
        "method": method,
        "fields_filled": filled,
        "status": "filled",
    }

    meta_path = f"/tmp/form_{form_id}_fill_result.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result


def _overlay_fallback(pdf_input_path: str, output_path: str, fill_data: dict) -> int:
    """Usa overlay posicional como fallback quando não há AcroForm."""
    from app.pipelines.pdf_filler.overlay_filler import fill_by_overlay, TextField

    # Mapeamento simples: empilha campos na primeira página verticalmente
    fields = []
    y = 50.0
    for key, value in fill_data.items():
        fields.append(TextField(page=0, x=50.0, y=y, text=f"{key}: {value}", font_size=10))
        y += 20.0

    return fill_by_overlay(pdf_input_path, output_path, fields)
