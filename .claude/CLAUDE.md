# BurnStyle - Project Guidelines

## Language Policy
- All text in the repository (code, comments, documentation, commit messages) must be written in English.

## Implementation Policy
- **Simplicity is the top priority**
- Meet requirements with minimal code
- Avoid unnecessary abstraction and over-engineering
- When in doubt, choose the simpler approach

## Overview
- Expense management app (full-stack)
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + Vite + Tailwind CSS v4
- Auth: WebAuthn/Passkey + JWT
- Client: Web app added to home screen via Google Chrome on iPhone

## Rule Files

### Development Guidelines
- [Architecture](rules/architecture.md) - Layered design & directory structure
- [Backend](rules/backend.md) - Python / FastAPI / SQLAlchemy conventions
- [Frontend](rules/frontend.md) - React / TypeScript / Tailwind CSS conventions
- [Database](rules/database.md) - PostgreSQL / Alembic / connection settings
- [Development Flow](rules/development.md) - Required lint & test processes
- [Development Commands](rules/commands.md) - Makefile command reference
- [Git & Deploy](rules/git.md) - Conventional Commits / GitHub Actions / Vercel

### Application Specifications
- [Product Concept](rules/concept.md) - Vision, target users & design philosophy
- [Screens](rules/screens.md) - Screen list, navigation flow & data visualization
- [API Specification](rules/api.md) - Endpoints, requests & responses
- [Authentication](rules/auth.md) - WebAuthn/Passkey + JWT flow
- [Data Model](rules/data-model.md) - Table definitions & ER diagram
- [Infrastructure & Deploy](rules/infra.md) - Docker / CI/CD / Vercel / environment variables
