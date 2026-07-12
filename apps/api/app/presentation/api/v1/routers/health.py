"""Health check detalhado: banco, Redis, worker."""
from __future__ import annotations
import time
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


async def _check_db() -> dict:
    start = time.monotonic()
    try:
        from app.infrastructure.database.base import async_session_factory
        from sqlalchemy import text
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "latency_ms": round((time.monotonic() - start) * 1000, 1)}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


async def _check_redis() -> dict:
    start = time.monotonic()
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url)
        await r.ping()
        await r.aclose()
        return {"status": "ok", "latency_ms": round((time.monotonic() - start) * 1000, 1)}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


async def _check_worker() -> dict:
    try:
        from app.celery_client import celery_app
        inspect = celery_app.control.inspect(timeout=2)
        active = inspect.active()
        return {"status": "ok", "active_tasks": sum(len(v) for v in (active or {}).values())}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/health/live")
async def liveness():
    """Kubernetes liveness probe — resposta rápida."""
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness():
    """Kubernetes readiness probe — verifica dependências."""
    db, redis, worker = await _check_db(), await _check_redis(), await _check_worker()
    all_ok = all(c["status"] == "ok" for c in [db, redis, worker])
    return {
        "status": "ok" if all_ok else "degraded",
        "checks": {"database": db, "redis": redis, "worker": worker},
    }
