"""Configurações centralizadas via Pydantic Settings."""
from __future__ import annotations
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/saas_form_filler"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret: str = "changeme"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # Groq
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    groq_max_tokens: int = 2000
    groq_timeout_seconds: int = 30

    # Supabase Storage
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_bucket: str = "forms"

    # Security
    encryption_key: str = ""
    metrics_token: str = ""

    # LGPD
    data_retention_days: int = 90
    audit_log_retention_years: int = 7

    # Rate limits
    rate_limit_auth_per_minute: int = 10
    rate_limit_upload_per_hour: int = 50


settings = Settings()
