# API Specification

Base URL: `/` (backend server)

Authentication: `Authorization: Bearer <JWT>` header (for authenticated endpoints)

## Health Check

| Method | Path | Response |
|--------|------|----------|
| GET | `/` | `{ message: "BurnStyle API is running" }` |
| GET | `/health` | `{ status: "healthy" }` |

## Authentication `/auth`

### Passkey Registration

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/auth/register/options` | `{ name }` | `{ options }` |
| POST | `/auth/register/verify` | `{ name, credential }` | `{ message }` |

### Passkey Authentication

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/auth/signin/options` | `{ name }` | `{ options }` |
| POST | `/auth/signin/verify` | `{ name, credential }` | `{ access_token, token_type }` |

## User `/me`

All endpoints require authentication.

| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | `/me` | - | `{ uuid, name }` | 200 |
| PATCH | `/me` | `{ name }` | `{ uuid, name }` | 200 |
| DELETE | `/me` | - | - | 204 |
| GET | `/me/export` | - | `{ name, categories, expenses }` | 200 |

## Categories `/categories`

All endpoints require authentication.

| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | `/categories` | - | `CategoryResponse[]` | 200 |
| POST | `/categories` | `{ name }` | `CategoryResponse` | 201 |
| PATCH | `/categories/{uuid}` | `{ name? }` | `CategoryResponse` | 200 |
| DELETE | `/categories/{uuid}` | - | - | 204 |
| POST | `/categories/{uuid}/merge` | `{ target_uuid }` | `CategoryResponse` | 200 |

**CategoryResponse**: `{ uuid, name }`

Merge re-links expenses and templates from `{uuid}` to `target_uuid`, deduplicating overlap, then deletes the source. Returns the target. 400 if `uuid == target_uuid`, 404 if either is missing or owned by another user.

## Expenses `/expenses`

All endpoints require authentication.

| Method | Path | Params | Request | Response | Status |
|--------|------|--------|---------|----------|--------|
| GET | `/expenses` | `?year=&month=` | - | `ExpenseResponse[]` | 200 |
| GET | `/expenses/{uuid}` | - | - | `ExpenseResponse` | 200 |
| POST | `/expenses` | - | `ExpenseCreate` | `ExpenseResponse` | 201 |
| PATCH | `/expenses/{uuid}` | - | `ExpenseUpdate` | `ExpenseResponse` | 200 |
| DELETE | `/expenses/{uuid}` | - | - | - | 204 |

**ExpenseCreate**: `{ name, amount, expensed_at, category_uuid? }`

**ExpenseUpdate**: `{ name?, amount?, expensed_at?, category_uuid? }`

**ExpenseResponse**:
```json
{
  "uuid": "string",
  "name": "string",
  "amount": 0,
  "expensed_at": "ISO 8601 (JST)",
  "created_at": "ISO 8601 (JST)",
  "updated_at": "ISO 8601 (JST)",
  "deleted_at": "ISO 8601 (JST) | null",
  "categories": [{ "uuid": "string", "name": "string" }]
}
```

## Expense Templates `/expense-templates`

All endpoints require authentication.

| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | `/expense-templates` | - | `ExpenseTemplateResponse[]` | 200 |
| POST | `/expense-templates` | `{ name, amount, category_uuid }` | `ExpenseTemplateResponse` | 201 |
| PATCH | `/expense-templates/{uuid}` | `{ name?, amount?, category_uuid? }` | `ExpenseTemplateResponse` | 200 |
| DELETE | `/expense-templates/{uuid}` | - | - | 204 |
| POST | `/expense-templates/bulk-record` | `{ template_uuids }` | `{ created_count, message }` | 200 |

## Common Specifications

- **Timezone**: Stored in UTC, API responses converted to JST
- **UUID**: v7, 32 characters without hyphens
- **Soft Delete**: `deleted_at` column (excluded from GET, included in export)
- **Amount**: Positive integers only (`amount > 0`)
- **Token Refresh**: New JWT returned via `X-New-Token` response header on every authenticated request
