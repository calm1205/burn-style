# Backend Conventions

## Tech Stack
- **Language**: Python 3.14
- **Package Manager**: uv
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.x
- **Validation**: Pydantic
- **Type Checker**: mypy (strict mode)
- **Linter/Formatter**: ruff (line length 120)

## Coding Conventions
- Add `from __future__ import annotations` at the top of each file
- **UUID**: Use uuid6 (v7), 32 characters without hyphens
- **Deletion**: Soft delete (`deleted_at` column)
- `print()` is only allowed in `scripts/` directory
- `.env` must not be committed (use `.env.template` instead)

## mypy
- Strict mode required
- Type annotations on all functions and variables

## ruff
- Line length: 120
- Auto-fix with `ruff check --fix .`
