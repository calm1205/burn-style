# Backend Conventions

## Python Version
- Pin to **3.12** in `backend/.python-version` and `requires-python = ">=3.12"` in `backend/pyproject.toml`
- Do NOT bump to 3.13+ without confirming Vercel's Python runtime supports it — Vercel currently supports up to 3.12, and a mismatch causes `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'` in production (cp3XX wheel bundled by CI fails to load under Vercel's runtime ABI)
- If upgrade is needed, change `.python-version` + `pyproject.toml` together, then `cd backend && uv lock` to regenerate wheels

## Coding Conventions
- Add `from __future__ import annotations` at the top of each file
- **UUID**: Use uuid6 (v7), 32 characters without hyphens
- **Deletion**: Soft delete via `deleted_at` column
- `print()` is only allowed in `scripts/` directory

## Logging
- Use `src.logger.get_logger(name)` — never `print()` in app code
- Pass structured data via `extra={...}` (e.g. `logger.info("user signed in", extra={"event": "signin"})`)
- `request_id` and `user_uuid` are auto-injected from contextvars — do not pass them explicitly

## mypy / ruff
- mypy strict mode required, type annotations on all functions and variables
- ruff line length: 120

## Date / Time
- For "JST today", use `datetime.now(JST).date()` — `date.today()` is OS-tz dependent and forbidden
- `python-dateutil` is allowed only for `relativedelta` (month arithmetic). `dateutil.parser` is forbidden
- For recurring schedules, compute dates from `start_date + n × interval` to avoid drift on month-end edges (do not chain from "last + interval")
