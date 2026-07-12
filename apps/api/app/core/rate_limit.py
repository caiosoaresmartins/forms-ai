"""Rate limiting via Redis (sliding window) para endpoints críticos."""
from __future__ import annotations
import time
from fastapi import HTTPException, Request, status
from app.core.config import settings

try:
    import redis.asyncio as aioredis
    _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
except Exception:
    _redis = None


async def _check_rate(key: str, limit: int, window_seconds: int) -> None:
    """Sliding window counter via Redis INCR + EXPIRE."""
    if _redis is None:
        return  # sem Redis → não bloqueia (fail open)
    try:
        pipe = _redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds)
        results = await pipe.execute()
        count = results[0]
        if count > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Muitas requisições. Tente novamente em breve.",
                headers={"Retry-After": str(window_seconds)},
            )
    except HTTPException:
        raise
    except Exception:
        pass  # fail open se Redis indisponível


async def rate_limit_auth(request: Request) -> None:
    """10 tentativas de auth por IP por minuto."""
    ip = request.client.host if request.client else "unknown"
    await _check_rate(f"rl:auth:{ip}", settings.rate_limit_auth_per_minute, 60)


async def rate_limit_upload(request: Request) -> None:
    """50 uploads por IP por hora."""
    ip = request.client.host if request.client else "unknown"
    await _check_rate(f"rl:upload:{ip}", settings.rate_limit_upload_per_hour, 3600)
