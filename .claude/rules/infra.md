# Infrastructure & Deploy

## Deploy
- Platform: Vercel (frontend + backend)
- Production DB: Neon (PostgreSQL)
- CI/CD: GitHub Actions `workflow_dispatch` (manual trigger), production / preview selectable
- Workflows: `deploy_backend.yml` / `deploy_frontend.yml`

## DB Connection Switching
- `VERCEL_ENV=production` → Neon
- Otherwise → local Docker

## CORS

- CORS headers are set at the Vercel edge layer via `backend/vercel.json` (`headers`), not by FastAPI middleware.
- The OPTIONS preflight is handled by a catch-all route in `backend/src/main.py` that returns 204 (Vercel adds the CORS headers).
- The frontend origin in `vercel.json` is hard-coded; update it there if the production URL changes.

## Environment Variables

### Local + Production
| Variable | Purpose |
|----------|---------|
| `JWT_SECRET_KEY` | JWT signing secret (32+ chars in production) |
| `WEBAUTHN_RP_ID` | WebAuthn RP ID |
| `WEBAUTHN_RP_NAME` | WebAuthn RP name |
| `FRONTEND_ORIGIN` | WebAuthn `expected_origin` for register/sign-in verification (NOT used for CORS — that's in `vercel.json`) |
| `CRON_SECRET` | Bearer token for `/cron/*` endpoints (32+ chars recommended) |

### Production Only
| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API endpoint URL |
| `POSTGRES_URL` | Neon DB connection URL |
| `VERCEL_ENV` | `production` selects production DB |
