"""Entrypoint FastAPI com CORS, routers e middleware de segurança."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.presentation.api.v1.routers import auth, forms, lgpd
from app.routers import checklist

app = FastAPI(
    title="Forms AI API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(forms.router, prefix="/forms", tags=["forms"])
app.include_router(lgpd.router, prefix="/lgpd", tags=["lgpd"])
app.include_router(checklist.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
