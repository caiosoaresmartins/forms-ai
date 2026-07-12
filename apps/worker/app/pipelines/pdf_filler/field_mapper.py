"""Mapeia dados do JSON de partes/checklist para campos do formulário PDF."""
from __future__ import annotations
import re
import logging

logger = logging.getLogger(__name__)

# Mapeamento padrão: chave interna → variações de nome de campo AcroForm
FIELD_ALIASES: dict[str, list[str]] = {
    "buyer_name": ["COMPRADOR", "ADQUIRENTE", "NOME DO COMPRADOR", "Nome do Comprador"],
    "buyer_cpf": ["CPF COMPRADOR", "CPF DO COMPRADOR", "CPF"],
    "buyer_rg": ["RG COMPRADOR", "RG DO COMPRADOR", "RG"],
    "seller_name": ["VENDEDOR", "CEDENTE", "NOME DO VENDEDOR", "Nome do Vendedor"],
    "seller_cpf": ["CPF VENDEDOR", "CPF DO VENDEDOR"],
    "seller_rg": ["RG VENDEDOR", "RG DO VENDEDOR"],
    "property_address": ["ENDEREÇO", "ENDERECO", "Endereço do Imóvel", "ENDEREÇO DO IMÓVEL"],
    "property_value": ["VALOR", "VALOR DO IMÓVEL", "PREÇO"],
    "date": ["DATA", "DATA DA ASSINATURA", "Data"],
}


def normalize(text: str) -> str:
    """Normaliza texto para comparação: uppercase, sem acentos, sem espaços duplos."""
    import unicodedata
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", text.upper().strip())


def map_fields(available_fields: list[str], data: dict[str, str]) -> dict[str, str]:
    """
    Mapeia campos disponíveis no PDF para valores extraídos.

    Args:
        available_fields: Lista de nomes de campos AcroForm do PDF.
        data: Dicionário chave_interna → valor.

    Returns:
        Dicionário {campo_acroform: valor} pronto para preenchimento.
    """
    result: dict[str, str] = {}
    norm_available = {normalize(f): f for f in available_fields}

    for key, value in data.items():
        aliases = FIELD_ALIASES.get(key, [key])
        for alias in aliases:
            norm_alias = normalize(alias)
            if norm_alias in norm_available:
                original_name = norm_available[norm_alias]
                result[original_name] = value
                logger.debug(f"Mapeado: '{key}' → '{original_name}' = '{value}'")
                break
        else:
            logger.debug(f"Campo '{key}' não encontrado no PDF")

    return result
