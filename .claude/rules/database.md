# Database Conventions

## Tech Stack
- **DB**: PostgreSQL
- **ORM**: SQLAlchemy 2.x
- **Migration**: Alembic (autogenerate)

## Connection Switching
- `VERCEL_ENV=production` → Neon (production)
- Otherwise → Local Docker

## Local Development
- Start PostgreSQL with `docker compose up -d db`
- Start all services with hot reload via `docker compose watch`
- Connect to CLI with `docker compose exec db sh -c 'psql -U $POSTGRES_USER $POSTGRES_DB'`

## Alembic
- Auto-generate migrations from models with `--autogenerate`
- Migration files: `backend/alembic/versions/`
- On `db-reset`, clear the versions directory and regenerate
