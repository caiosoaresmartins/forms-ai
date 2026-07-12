from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.presentation.api.v1.routers import auth, forms, documents, health

app = FastAPI(
    title="SaaS Form Filler",
    version="0.1.0",
    description="Plataforma de IA para leitura e preenchimento de formulários bancários e imobiliários",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(forms.router, prefix="/api/v1/forms", tags=["forms"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
