# BurnStyle - Project Guidelines

## Language Policy
- All text in the repository (code, comments, documentation, commit messages) must be written in English.
- **Exception**: JSDoc / Python docstrings are written in Japanese (concise, 1–2 lines focusing on WHY).

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

- [Product Concept](rules/concept.md) - Vision, target users & design philosophy
- [Backend](rules/backend.md) - Python coding conventions
- [Frontend](rules/frontend.md) - TypeScript / React coding conventions
- [Development Flow](rules/development.md) - Required lint & test process
- [Git](rules/git.md) - Conventional Commits / commit language
- [Infrastructure](rules/infra.md) - Deploy targets & environment variables

> Architecture, schemas, endpoints, screens, and commands are read directly from the codebase (`backend/src/`, `frontend/src/`, `Makefile`, `docker-compose.yml`).
