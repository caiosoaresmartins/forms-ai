"""Testes da API de documentos (upload + checklist update)."""
from __future__ import annotations

import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path: Path, monkeypatch):
    monkeypatch.setenv("DOCS_DIR", str(tmp_path / "docs"))
    monkeypatch.setenv("DATA_DIR", str(tmp_path))

    # Patch dos caminhos antes de importar o router
    import app.routers.documents as doc_module
    monkeypatch.setattr(doc_module, "DOCS_DIR", tmp_path / "docs")
    monkeypatch.setattr(doc_module, "DATA_DIR", tmp_path)

    from app.main import app
    return TestClient(app)


@pytest.fixture()
def checklist_file(tmp_path: Path) -> Path:
    data = {
        "checklist": [
            {
                "party_type": "buyer",
                "party_index": 1,
                "party_name": "João",
                "documents": [
                    {"name": "RG", "required": True, "uploaded": False},
                    {"name": "CPF", "required": True, "uploaded": False},
                ],
            }
        ]
    }
    path = tmp_path / "form_test_checklist.json"
    path.write_text(json.dumps(data))
    return path


def test_upload_documento_pdf(client: TestClient, tmp_path: Path):
    pdf_bytes = b"%PDF-1.4 fake pdf content"
    resp = client.post(
        "/forms/form_test/parties/1/documents",
        files={"file": ("contrato.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["original_name"] == "contrato.pdf"
    assert data["content_type"] == "application/pdf"
    assert "file_id" in data


def test_upload_tipo_invalido(client: TestClient):
    resp = client.post(
        "/forms/form_test/parties/1/documents",
        files={"file": ("virus.exe", io.BytesIO(b"MZ"), "application/octet-stream")},
    )
    assert resp.status_code == 415


def test_listar_documentos_vazio(client: TestClient):
    resp = client.get("/forms/form_nenhum/parties/1/documents")
    assert resp.status_code == 200
    assert resp.json() == {"documents": []}


def test_marcar_item_como_entregue(client: TestClient, checklist_file: Path):
    resp = client.patch(
        "/forms/form_test/checklist/0/0",
        json={"uploaded": True},
    )
    assert resp.status_code == 200
    assert resp.json()["uploaded"] is True

    updated = json.loads(checklist_file.read_text())
    assert updated["checklist"][0]["documents"][0]["uploaded"] is True


def test_marcar_item_invalido(client: TestClient, checklist_file: Path):
    resp = client.patch(
        "/forms/form_test/checklist/99/99",
        json={"uploaded": True},
    )
    assert resp.status_code == 404
