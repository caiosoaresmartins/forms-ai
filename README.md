# SaaS Form Filler

Plataforma de IA para leitura e preenchimento automático de formulários bancários e imobiliários em PDF.

## Stack

- **Backend:** Python 3.12, FastAPI 0.115, SQLAlchemy 2.0 async, Celery 5 + Redis
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **IA:** Groq API (llama-3.1-8b-instant) + PaddleOCR
- **Infra:** PostgreSQL 16, Redis 7, Docker Compose

## Estrutura

```
saas-form-filler/
├── apps/
│   ├── api/      # Backend FastAPI
│   ├── worker/   # Workers Celery
│   └── web/      # Frontend Next.js
├── infra/
│   └── docker/
├── docker-compose.yml
└── .env.example
```

## Como rodar

```bash
cp .env.example .env
docker compose up --build
```

## Roadmap

- [x] Bloco 1 — Fundação do monorepo
- [x] Bloco 2 — Pipeline OCR (PaddleOCR + pypdf + Celery)
- [ ] Bloco 3 — Checklist com LLM (Groq)
- [ ] Bloco 4 — Preenchimento de PDF
- [ ] Bloco 5 — Frontend Next.js
- [ ] Bloco 6 — Banco de dados e migrations
- [ ] Bloco 7 — Segurança e LGPD
- [ ] Bloco 8 — Escalabilidade e recursos avançados
