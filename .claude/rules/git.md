# Git & Deploy Guidelines

## Commit Messages
- Conventional Commits format: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, etc.
- Written in English

## Deploy
- **Platform**: Vercel
- **Trigger**: GitHub Actions `workflow_dispatch` (manual execution)
- **Environments**: production / preview selectable

## GitHub Actions Workflows
| File | Target |
|------|--------|
| `deploy_backend.yml` | Backend deploy |
| `deploy_frontend.yml` | Frontend deploy |

## Deploy Flow
1. Manually trigger from GitHub Actions tab
2. Select environment (production / preview)
3. Build & deploy via Vercel CLI
