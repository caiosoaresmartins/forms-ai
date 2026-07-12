"""Testes unitários do cliente Groq (mockando httpx)."""
import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock


GROQ_PARTIES_RESPONSE = json.dumps({
    "buyers": [{"index": 1, "type": "person", "name_field": "COMPRADOR"}],
    "sellers": [{"index": 1, "type": "person", "name_field": "VENDEDOR"}],
    "witnesses": [], "procurators": [], "spouses": []
})

GROQ_CHECKLIST_RESPONSE = json.dumps({
    "checklist": [{
        "party_type": "buyer",
        "party_index": 1,
        "party_name": "COMPRADOR",
        "documents": [
            {"name": "RG ou CNH", "required": True, "notes": "frente e verso"},
            {"name": "CPF", "required": True, "notes": ""},
        ]
    }]
})


def _mock_response(content: str):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "choices": [{"message": {"content": content}}]
    }
    mock_resp.raise_for_status = MagicMock()
    return mock_resp


@pytest.mark.asyncio
async def test_ask_groq_sends_correct_prompt():
    with patch("app.infrastructure.ai.groq_client.settings") as mock_settings:
        mock_settings.groq_api_key = "gsk_test"
        mock_settings.groq_model = "llama-3.1-8b-instant"
        mock_settings.groq_max_tokens = 2000
        mock_settings.groq_timeout_seconds = 30

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.post = AsyncMock(return_value=_mock_response("resposta teste"))

        with patch("app.infrastructure.ai.groq_client.httpx.AsyncClient", return_value=mock_client):
            from app.infrastructure.ai.groq_client import ask_groq
            result = await ask_groq("prompt teste", system="sistema")

        assert result == "resposta teste"
        mock_client.post.assert_called_once()


@pytest.mark.asyncio
async def test_analyze_form_parties_parses_json():
    with patch("app.infrastructure.ai.groq_client.settings") as mock_settings:
        mock_settings.groq_api_key = "gsk_test"
        mock_settings.groq_model = "llama-3.1-8b-instant"
        mock_settings.groq_max_tokens = 2000
        mock_settings.groq_timeout_seconds = 30

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.post = AsyncMock(return_value=_mock_response(GROQ_PARTIES_RESPONSE))

        with patch("app.infrastructure.ai.groq_client.httpx.AsyncClient", return_value=mock_client):
            from app.infrastructure.ai.groq_client import analyze_form_parties
            result = await analyze_form_parties("COMPRADOR: João VENDEDOR: Maria")

        assert "buyers" in result
        assert result["buyers"][0]["type"] == "person"


@pytest.mark.asyncio
async def test_generate_checklist_has_documents():
    with patch("app.infrastructure.ai.groq_client.settings") as mock_settings:
        mock_settings.groq_api_key = "gsk_test"
        mock_settings.groq_model = "llama-3.1-8b-instant"
        mock_settings.groq_max_tokens = 2000
        mock_settings.groq_timeout_seconds = 30

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.post = AsyncMock(return_value=_mock_response(GROQ_CHECKLIST_RESPONSE))

        with patch("app.infrastructure.ai.groq_client.httpx.AsyncClient", return_value=mock_client):
            from app.infrastructure.ai.groq_client import generate_checklist
            parties = {"buyers": [{"index": 1, "type": "person", "name_field": "COMPRADOR"}],
                       "sellers": [], "witnesses": [], "procurators": [], "spouses": []}
            result = await generate_checklist(parties)

        assert "checklist" in result
        assert len(result["checklist"]) > 0
        assert len(result["checklist"][0]["documents"]) > 0
