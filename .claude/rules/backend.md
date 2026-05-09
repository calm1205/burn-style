# Backend Conventions

## Coding Conventions
- Add `from __future__ import annotations` at the top of each file
- **UUID**: Use uuid6 (v7), 32 characters without hyphens
- **Deletion**: Soft delete via `deleted_at` column
- `print()` is only allowed in `scripts/` directory
- `.env` must not be committed (use `.env.template` instead)

## mypy / ruff
- mypy strict mode required, type annotations on all functions and variables
- ruff line length: 120
