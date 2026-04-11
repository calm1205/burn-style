# Infrastructure & Deploy

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS v4 |
| Backend | FastAPI + SQLAlchemy 2.x + Python 3.14 |
| Database | PostgreSQL 18 |
| Package Manager | npm (frontend) / uv (backend) |
| Linter | oxlint + oxfmt (frontend) / ruff + mypy strict (backend) |
| Authentication | WebAuthn + JWT |
| Deploy | Vercel |
| CI/CD | GitHub Actions |

## Local Development Environment

### Docker Compose Configuration

| Service | Image | Port |
|---------|-------|------|
| backend | Python 3.14-slim + uvicorn | 9999 |
| frontend | Node 22-slim + Vite | 5173 |
| db | PostgreSQL 18 | 5432 |

### Hot Reload

Auto-sync with `docker compose watch`:

| Service | Sync Target | Action |
|---------|-------------|--------|
| backend | `src/`, `pyproject.toml`, `uv.lock` | sync |
| backend | `Dockerfile` | rebuild |
| frontend | `src/`, `public/`, `index.html` | sync |
| frontend | `package.json` | rebuild |

## Deploy

### Platform

Vercel (both backend and frontend)

Production DB: Neon (PostgreSQL)

### CI/CD Workflow

Environment selected via manual execution (`workflow_dispatch`).

```
deploy.yml (unified)
  ├─ deploy_backend.yml
  │     ├─ lint-and-test (mypy + ruff + pytest)
  │     └─ deploy (Vercel CLI)
  └─ deploy_frontend.yml
        ├─ lint (oxlint + oxfmt)
        └─ deploy (Vercel CLI)
```

### Environments

| Environment | Purpose |
|-------------|---------|
| production | Production (`--prod` flag) |
| preview | Preview |

## Environment Variables

### Local Only

| Variable | Purpose |
|----------|---------|
| `API_PORT` | Backend port (9999) |
| `POSTGRES_USER` / `PASSWORD` / `DB` | DB connection info |
| `POSTGRES_PORT` | DB port (5432) |
| `DATABASE_URL` | DB connection URL |
| `FRONTEND_PORT` | Frontend port (5173) |

### Local + Production

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET_KEY` | JWT signing secret key |
| `WEBAUTHN_RP_ID` | WebAuthn RP ID |
| `WEBAUTHN_RP_NAME` | WebAuthn RP name |
| `FRONTEND_ORIGIN` | CORS origin |

### Production Only

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API endpoint URL |
| `POSTGRES_URL` | Neon DB connection URL |
| `VERCEL_ENV` | Connect to production DB with `production` |
