"""Entrypoint FastAPI com CORS, routers e middleware de segurança."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.presentation.api.v1.routers import auth, forms, lgpd
from app.routers import checklist, documents, pdf_download

app = FastAPI(
    title="Forms AI API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — lê ALLOWED_ORIGINS do ambiente (separado por vírgula)
_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(forms.router, prefix="/forms", tags=["forms"])
app.include_router(lgpd.router, prefix="/lgpd", tags=["lgpd"])
app.include_router(checklist.router)
app.include_router(documents.router)
app.include_router(pdf_download.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
