"""Disparo de webhooks para eventos de formulário."""
from __future__ import annotations
import hashlib
import hmac
import json
import time
from datetime import datetime, timezone
from typing import Any

try:
    import httpx
    _httpx_available = True
except ImportError:
    _httpx_available = False


def _sign_payload(secret: str, payload: bytes) -> str:
    """HMAC-SHA256 para verificação de autenticidade no receptor."""
    return hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()


async def dispatch_webhook(
    url: str,
    event: str,
    data: dict[str, Any],
    secret: str | None = None,
    timeout: float = 10.0,
) -> bool:
    """Dispara webhook com assinatura HMAC opcional. Retorna True se 2xx."""
    if not _httpx_available:
        return False

    payload = json.dumps({
        "event": event,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }, default=str).encode()

    headers = {"Content-Type": "application/json"}
    if secret:
        headers["X-Signature-SHA256"] = f"sha256={_sign_payload(secret, payload)}"

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, content=payload, headers=headers)
            return resp.is_success
    except Exception:
        return False


# Eventos disponíveis
EVENT_FORM_ANALYZED = "form.analyzed"
EVENT_FORM_COMPLETED = "form.completed"
EVENT_CHECKLIST_COMPLETED = "checklist.completed"
