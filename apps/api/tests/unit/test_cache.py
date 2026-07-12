"""Testes do módulo de cache Redis (mock)."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_cache_set_and_get():
    mock_redis = AsyncMock()
    mock_redis.get = AsyncMock(return_value='{"key": "value"}')
    mock_redis.setex = AsyncMock()

    with patch("app.core.cache._redis", mock_redis):
        from app.core.cache import cache_set, cache_get
        await cache_set("test:key", {"key": "value"}, ttl=60)
        result = await cache_get("test:key")

    assert result == {"key": "value"}


@pytest.mark.asyncio
async def test_cache_get_miss_returns_none():
    mock_redis = AsyncMock()
    mock_redis.get = AsyncMock(return_value=None)

    with patch("app.core.cache._redis", mock_redis):
        from app.core.cache import cache_get
        result = await cache_get("nonexistent")

    assert result is None


@pytest.mark.asyncio
async def test_cache_delete():
    mock_redis = AsyncMock()
    mock_redis.delete = AsyncMock()

    with patch("app.core.cache._redis", mock_redis):
        from app.core.cache import cache_delete
        await cache_delete("test:key")

    mock_redis.delete.assert_called_once_with("test:key")


@pytest.mark.asyncio
async def test_cache_no_redis_returns_none():
    with patch("app.core.cache._redis", None):
        from app.core.cache import cache_get, cache_set
        result = await cache_get("key")
        assert result is None
        await cache_set("key", "value")  # não deve lançar
