# Architecture

## Layered Design
- `backend/src/api/` → `backend/src/service/` → `backend/src/repository/` → `backend/src/model/`
- Pydantic schemas: `backend/src/schema/`
- Entry point: `backend/src/main.py`
- Configuration: `backend/src/config.py`

## Directory Structure
```
burn-style/
├── backend/
│   ├── src/
│   │   ├── api/          # Router & endpoint definitions
│   │   ├── service/      # Business logic
│   │   ├── repository/   # DB operations
│   │   ├── model/        # SQLAlchemy models
│   │   ├── schema/       # Pydantic schemas
│   │   ├── config.py     # Environment settings
│   │   └── main.py       # FastAPI app initialization
│   ├── alembic/          # Migrations
│   └── scripts/          # Seed scripts, etc.
├── frontend/
│   └── src/              # React app
├── .github/workflows/    # GitHub Actions
├── Makefile              # Development commands
└── docker-compose.yml    # Local development environment
```

## Authentication
- Passwordless authentication via WebAuthn/Passkey
- Session management via JWT (JSON Web Token)
- Related models: `User`, `WebAuthnCredential`
