# データモデル

## ER図（概要）

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

## テーブル定義

### users

| カラム | 型 | 制約 |
|--------|-----|------|
| uuid | String(32) | PK, UUID v7 |
| name | String | UNIQUE, NOT NULL |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |

### webauthn_credentials

| カラム | 型 | 制約 |
|--------|-----|------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| credential_id | LargeBinary | UNIQUE, NOT NULL |
| credential_public_key | LargeBinary | NOT NULL |
| sign_count | Integer | default 0 |
| transports | Text | nullable, JSON文字列 |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |

### categories

| カラム | 型 | 制約 |
|--------|-----|------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| name | String | NOT NULL |

### expenses

| カラム | 型 | 制約 |
|--------|-----|------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| name | String | NOT NULL |
| amount | Integer | NOT NULL, CHECK(amount > 0) |
| expensed_at | DateTime(UTC) | default now() |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |
| deleted_at | DateTime | nullable（論理削除） |

### expense_category_association

支出とカテゴリの多対多中間テーブル。

| カラム | 型 | 制約 |
|--------|-----|------|
| expense_uuid | String(32) | PK, FK → expenses.uuid, CASCADE |
| category_uuid | String(32) | PK, FK → categories.uuid, CASCADE |
| created_at | DateTime(UTC) | |

### expense_templates

| カラム | 型 | 制約 |
|--------|-----|------|
| uuid | String(32) | PK |
| user_uuid | String(32) | FK → users.uuid, CASCADE |
| name | String | NOT NULL |
| amount | Integer | NOT NULL, CHECK(amount > 0) |
| category_uuid | String(32) | FK → categories.uuid, CASCADE |
| created_at | DateTime(UTC) | |
| updated_at | DateTime(UTC) | |
| deleted_at | DateTime | nullable（論理削除） |

## 設計方針

- **UUID v7**: 時系列ソート可能なID生成（uuid6ライブラリ）
- **論理削除**: expenses, expense_templatesは`deleted_at`による論理削除
- **CASCADE削除**: ユーザー削除時に関連データを全削除
- **タイムゾーン**: DB保存はUTC、アプリケーション層でJST変換
