# Infrastructure & Deploy

## Deploy
- Platform: Vercel (frontend + backend)
- Production DB: Neon (PostgreSQL)
- CI/CD: GitHub Actions `workflow_dispatch` (manual trigger), production / preview selectable
- Workflows: `deploy_backend.yml` / `deploy_frontend.yml`

## DB Connection Switching
- `VERCEL_ENV=production` → Neon
- Otherwise → local Docker

## Environment Variables

### Local + Production
| Variable | Purpose |
|----------|---------|
| `JWT_SECRET_KEY` | JWT signing secret (32+ chars in production) |
| `WEBAUTHN_RP_ID` | WebAuthn RP ID |
| `WEBAUTHN_RP_NAME` | WebAuthn RP name |
| `FRONTEND_ORIGIN` | CORS origin |

### Production Only
| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API endpoint URL |
| `POSTGRES_URL` | Neon DB connection URL |
| `VERCEL_ENV` | `production` selects production DB |
