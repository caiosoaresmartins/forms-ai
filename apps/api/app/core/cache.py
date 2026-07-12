"""Cache Redis com suporte a JSON e TTL configurável."""
from __future__ import annotations
import json
from typing import Any
from app.core.config import settings

try:
    import redis.asyncio as aioredis
    _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
except Exception:
    _redis = None

_DEFAULT_TTL = 300  # 5 minutos


async def cache_get(key: str) -> Any | None:
    if _redis is None:
        return None
    try:
        raw = await _redis.get(key)
        return json.loads(raw) if raw is not None else None
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: int = _DEFAULT_TTL) -> None:
    if _redis is None:
        return
    try:
        await _redis.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


async def cache_delete(key: str) -> None:
    if _redis is None:
        return
    try:
        await _redis.delete(key)
    except Exception:
        pass


async def cache_delete_pattern(pattern: str) -> None:
    """Invalida todas as chaves que batem com o padrão (ex: 'forms:tenant:*')."""
    if _redis is None:
        return
    try:
        keys = await _redis.keys(pattern)
        if keys:
            await _redis.delete(*keys)
    except Exception:
        pass
