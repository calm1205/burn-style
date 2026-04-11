# Development Commands

## Startup
| Command | Description |
|---------|-------------|
| `docker compose watch` | Start local development (hot reload) |

## Lint
| Command | Description |
|---------|-------------|
| `make lint` | Run backend (mypy + ruff) + frontend (oxlint + oxfmt) |

## Test
| Command | Description |
|---------|-------------|
| `make test-backend` | Run backend tests |

## Database (Local)
| Command | Description |
|---------|-------------|
| `make upgrade` | Apply migrations |
| `make downgrade` | Downgrade by one revision |
| `make seed` | Insert seed data (specify user with `SEED_USER="name"`) |
| `make db-clear` | Clear DB completely (delete volumes) |
| `make db-connect` | Connect to PostgreSQL CLI |

## Database (Production - Neon)
| Command | Description |
|---------|-------------|
| `make prod-upgrade` | Run migrations on production DB |
