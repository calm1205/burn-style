# 認証

## 概要

パスワードレス認証を採用。WebAuthn/パスキーでユーザー認証し、JWTでセッション管理。

## 認証フロー

### 1. パスキー登録

```
Client                        Server
  │                              │
  ├─ POST /auth/register/options ─→│ (username送信)
  │                              ├─ WebAuthn options生成
  │                              ├─ Challenge保存 (TTL 5分)
  │←─────── options ─────────────┤
  ├─ パスキー生成 (ブラウザ)       │
  ├─ POST /auth/register/verify ──→│ (credential送信)
  │                              ├─ Challenge検証
  │                              ├─ User + Credential作成
  │←─────── { message } ─────────┤
```

### 2. パスキー認証

```
Client                        Server
  │                              │
  ├─ POST /auth/signin/options ──→│ (username送信)
  │                              ├─ WebAuthn options生成
  │                              ├─ Challenge保存 (TTL 5分)
  │←─────── options ─────────────┤
  ├─ パスキー認証 (ブラウザ)       │
  ├─ POST /auth/signin/verify ───→│ (credential送信)
  │                              ├─ Challenge検証
  │                              ├─ sign_count更新
  │                              ├─ JWT生成
  │←─── { access_token } ────────┤
```

### 3. 認証済みリクエスト

```
Client                        Server
  │                              │
  ├─ GET /expenses ──────────────→│ (Authorization: Bearer <JWT>)
  │                              ├─ JWT検証
  │                              ├─ ユーザー取得
  │                              ├─ 新JWT生成
  │←─── data + X-New-Token ──────┤
  ├─ トークン更新 (localStorage)   │
```

## JWT仕様

| 項目 | 値 |
|------|-----|
| アルゴリズム | HS256 |
| 有効期限 | 15分 |
| ペイロード | `{ sub: user_uuid, exp }` |
| リフレッシュ | リクエスト毎に`X-New-Token`ヘッダーで自動再発行 |

## セキュリティ

- **SecurityHeadersMiddleware**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- **CORS**: フロントエンドオリジンのみ許可
- **JWT秘密鍵**: 本番環境では32文字以上必須
- **Challenge TTL**: 5分で自動失効
- **401時**: クライアント側で自動的に`/signin`へリダイレクト
