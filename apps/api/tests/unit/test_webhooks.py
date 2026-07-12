"""Testes do módulo de webhooks."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_dispatch_webhook_success():
    mock_response = MagicMock()
    mock_response.is_success = True

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(return_value=mock_response)

    with patch("app.core.webhooks.httpx.AsyncClient", return_value=mock_client):
        from app.core.webhooks import dispatch_webhook
        result = await dispatch_webhook(
            url="https://example.com/webhook",
            event="form.analyzed",
            data={"form_id": "123"},
        )

    assert result is True


@pytest.mark.asyncio
async def test_dispatch_webhook_with_signature():
    mock_response = MagicMock(is_success=True)
    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(return_value=mock_response)

    with patch("app.core.webhooks.httpx.AsyncClient", return_value=mock_client):
        from app.core.webhooks import dispatch_webhook
        result = await dispatch_webhook(
            url="https://example.com/webhook",
            event="form.completed",
            data={"form_id": "456"},
            secret="my-secret",
        )

    assert result is True
    call_kwargs = mock_client.post.call_args
    headers = call_kwargs.kwargs.get("headers", {})
    assert "X-Signature-SHA256" in headers


@pytest.mark.asyncio
async def test_dispatch_webhook_failure():
    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(side_effect=Exception("timeout"))

    with patch("app.core.webhooks.httpx.AsyncClient", return_value=mock_client):
        from app.core.webhooks import dispatch_webhook
        result = await dispatch_webhook(url="https://fail.com", event="x", data={})

    assert result is False
