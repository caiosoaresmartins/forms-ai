"""Métricas Prometheus expostas em /metrics."""
from __future__ import annotations
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from app.core.config import settings

try:
    from prometheus_client import (
        Counter, Histogram, Gauge,
        generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry,
    )
    _registry = CollectorRegistry(auto_describe=True)

    http_requests_total = Counter(
        "http_requests_total",
        "Total de requisições HTTP",
        ["method", "endpoint", "status_code"],
        registry=_registry,
    )
    http_request_duration_seconds = Histogram(
        "http_request_duration_seconds",
        "Duração das requisições HTTP em segundos",
        ["method", "endpoint"],
        registry=_registry,
    )
    forms_processed_total = Counter(
        "forms_processed_total",
        "Total de formulários processados",
        ["tenant_id", "status"],
        registry=_registry,
    )
    active_celery_tasks = Gauge(
        "active_celery_tasks",
        "Tarefas Celery ativas no momento",
        registry=_registry,
    )
    _prometheus_available = True
except ImportError:
    _prometheus_available = False

router = APIRouter()


@router.get("/metrics", response_class=PlainTextResponse)
async def metrics(request: Request):
    """Endpoint de métricas Prometheus (protegido por token)."""
    token = request.headers.get("Authorization", "")
    if settings.metrics_token and token != f"Bearer {settings.metrics_token}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not _prometheus_available:
        return PlainTextResponse("# prometheus_client não instalado\n")
    return PlainTextResponse(generate_latest(_registry), media_type=CONTENT_TYPE_LATEST)


def record_request(method: str, endpoint: str, status_code: int, duration: float) -> None:
    if not _prometheus_available:
        return
    http_requests_total.labels(method=method, endpoint=endpoint, status_code=str(status_code)).inc()
    http_request_duration_seconds.labels(method=method, endpoint=endpoint).observe(duration)


def record_form_processed(tenant_id: str, status: str) -> None:
    if not _prometheus_available:
        return
    forms_processed_total.labels(tenant_id=tenant_id, status=status).inc()
