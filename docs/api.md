# API仕様

ベースURL: `/` (バックエンドサーバー)

認証: `Authorization: Bearer <JWT>` ヘッダー（認証必須エンドポイント）

## ヘルスチェック

| メソッド | パス | レスポンス |
|---------|------|-----------|
| GET | `/` | `{ message: "BurnStyle API is running" }` |
| GET | `/health` | `{ status: "healthy" }` |

## 認証 `/auth`

### パスキー登録

| メソッド | パス | リクエスト | レスポンス |
|---------|------|-----------|-----------|
| POST | `/auth/register/options` | `{ name }` | `{ options }` |
| POST | `/auth/register/verify` | `{ name, credential }` | `{ message }` |

### パスキー認証

| メソッド | パス | リクエスト | レスポンス |
|---------|------|-----------|-----------|
| POST | `/auth/signin/options` | `{ name }` | `{ options }` |
| POST | `/auth/signin/verify` | `{ name, credential }` | `{ access_token, token_type }` |

## ユーザー `/me`

全エンドポイント認証必須。

| メソッド | パス | リクエスト | レスポンス | ステータス |
|---------|------|-----------|-----------|-----------|
| GET | `/me` | - | `{ uuid, name }` | 200 |
| PATCH | `/me` | `{ name }` | `{ uuid, name }` | 200 |
| DELETE | `/me` | - | - | 204 |
| GET | `/me/export` | - | `{ name, categories, expenses }` | 200 |

## カテゴリ `/categories`

全エンドポイント認証必須。

| メソッド | パス | リクエスト | レスポンス | ステータス |
|---------|------|-----------|-----------|-----------|
| GET | `/categories` | - | `CategoryResponse[]` | 200 |
| POST | `/categories` | `{ name }` | `CategoryResponse` | 201 |
| PATCH | `/categories/{uuid}` | `{ name? }` | `CategoryResponse` | 200 |
| DELETE | `/categories/{uuid}` | - | - | 204 |

**CategoryResponse**: `{ uuid, name }`

## 支出 `/expenses`

全エンドポイント認証必須。

| メソッド | パス | パラメータ | リクエスト | レスポンス | ステータス |
|---------|------|-----------|-----------|-----------|-----------|
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

## 支出テンプレート `/expense-templates`

全エンドポイント認証必須。

| メソッド | パス | リクエスト | レスポンス | ステータス |
|---------|------|-----------|-----------|-----------|
| GET | `/expense-templates` | - | `ExpenseTemplateResponse[]` | 200 |
| POST | `/expense-templates` | `{ name, amount, category_uuid }` | `ExpenseTemplateResponse` | 201 |
| PATCH | `/expense-templates/{uuid}` | `{ name?, amount?, category_uuid? }` | `ExpenseTemplateResponse` | 200 |
| DELETE | `/expense-templates/{uuid}` | - | - | 204 |
| POST | `/expense-templates/bulk-record` | `{ template_uuids }` | `{ created_count, message }` | 200 |

## 共通仕様

- **タイムゾーン**: DB保存はUTC、APIレスポンスはJST変換
- **UUID**: v7、32文字ハイフンなし
- **論理削除**: `deleted_at`カラム（GET時は削除済み除外、exportは全件）
- **金額**: 正の整数のみ（`amount > 0`）
- **トークンリフレッシュ**: 認証リクエスト毎にレスポンスヘッダー`X-New-Token`で新JWTを返却
