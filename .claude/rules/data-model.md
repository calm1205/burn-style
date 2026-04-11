# Data Model

## ER Diagram (Overview)

```
User (1) ──── (N) WebAuthnCredential
  │
  ├── (1) ──── (N) Category
  │                    │
  │                    └── (N:N) ── Expense
  │                                   │
  ├── (1) ──────────────────── (N) ───┘
  │
  └── (1) ──── (N) ExpenseTemplate ──── (N:1) Category
```

## Table Definitions

### users

| Column | Type | Constraints |
|--------|------|-------------|
| uuid | String(32) | PK, UUID v7 |
| name | String | UNIQUE, NOT NULL |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |

### webauthn_credentials

| Column | Type | Constraints |
|--------|------|-------------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| credential_id | LargeBinary | UNIQUE, NOT NULL |
| credential_public_key | LargeBinary | NOT NULL |
| sign_count | Integer | default 0 |
| transports | Text | nullable, JSON string |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |

### categories

| Column | Type | Constraints |
|--------|------|-------------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| name | String | NOT NULL |

### expenses

| Column | Type | Constraints |
|--------|------|-------------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| name | String | NOT NULL |
| amount | Integer | NOT NULL, CHECK(amount > 0) |
| expensed_at | DateTime(UTC) | default now() |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |
| deleted_at | DateTime | nullable (soft delete) |

### expense_category_association

Many-to-many join table between expenses and categories.

| Column | Type | Constraints |
|--------|------|-------------|
| expense_uuid | String(32) | PK, FK → expenses.uuid, CASCADE |
| category_uuid | String(32) | PK, FK → categories.uuid, CASCADE |
| created_at | DateTime(UTC) | |

### expense_templates

| Column | Type | Constraints |
|--------|------|-------------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| name | String | NOT NULL |
| amount | Integer | NOT NULL, CHECK(amount > 0) |
| category_uuid | String(32) | FK → categories.uuid, CASCADE |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |
| deleted_at | DateTime | nullable (soft delete) |

## Design Principles

- **UUID v7**: Time-sortable ID generation (uuid6 library)
- **Soft Delete**: expenses and expense_templates use `deleted_at` for soft deletion
- **CASCADE Delete**: All related data deleted when user is deleted
- **Timezone**: Stored in UTC, converted to JST at the application layer
