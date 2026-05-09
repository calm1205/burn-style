# Backend Conventions

## Coding Conventions
- Add `from __future__ import annotations` at the top of each file
- **UUID**: Use uuid6 (v7), 32 characters without hyphens
- **Deletion**: Soft delete via `deleted_at` column
- `print()` is only allowed in `scripts/` directory
- `.env` must not be committed (use `.env.template` instead)

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
