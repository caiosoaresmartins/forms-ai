"""Testes do mapeador de campos."""
import pytest
from app.pipelines.pdf_filler.field_mapper import map_fields, normalize


def test_normalize_remove_acentos():
    assert normalize("Comprador") == "COMPRADOR"
    assert normalize("Endereço") == "ENDERECO"


def test_map_fields_basic():
    available = ["COMPRADOR", "CPF COMPRADOR", "DATA"]
    data = {"buyer_name": "João Silva", "buyer_cpf": "123.456.789-09"}
    result = map_fields(available, data)
    assert result.get("COMPRADOR") == "João Silva"
    assert result.get("CPF COMPRADOR") == "123.456.789-09"


def test_map_fields_alias_variante():
    available = ["ADQUIRENTE"]
    data = {"buyer_name": "Pedro"}
    # ADQUIRENTE não está em FIELD_ALIASES para buyer_name por padrão,
    # mas o campo pode existir no PDF — deve retornar vazio sem crash
    result = map_fields(available, data)
    # Não deve lançar exceção
    assert isinstance(result, dict)


def test_map_fields_sem_match():
    available = ["CAMPO_DESCONHECIDO"]
    data = {"buyer_name": "Maria"}
    result = map_fields(available, data)
    assert "CAMPO_DESCONHECIDO" not in result
