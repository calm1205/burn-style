# インフラ・デプロイ

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS v4 |
| バックエンド | FastAPI + SQLAlchemy 2.x + Python 3.14 |
| データベース | PostgreSQL 18 |
| パッケージ管理 | npm (frontend) / uv (backend) |
| リンター | Biome 2.x (frontend) / ruff + mypy strict (backend) |
| 認証 | WebAuthn + JWT |
| デプロイ | Vercel |
| CI/CD | GitHub Actions |

## ローカル開発環境

### Docker Compose構成

| サービス | イメージ | ポート |
|---------|---------|--------|
| backend | Python 3.14-slim + uvicorn | 9999 |
| frontend | Node 22-slim + Vite | 5173 |
| db | PostgreSQL 18 | 5432 |

### ホットリロード

`docker compose watch` で以下を自動同期:

| サービス | 同期対象 | アクション |
|---------|---------|-----------|
| backend | `src/`, `pyproject.toml`, `uv.lock` | sync |
| backend | `Dockerfile` | rebuild |
| frontend | `src/`, `public/`, `index.html` | sync |
| frontend | `package.json` | rebuild |

## デプロイ

### プラットフォーム

Vercel（バックエンド・フロントエンドともに）

本番DB: Neon (PostgreSQL)

### CI/CDワークフロー

手動実行（`workflow_dispatch`）で環境を選択。

```
deploy.yml (統合)
  ├─ deploy_backend.yml
  │     ├─ lint-and-test (mypy + ruff + pytest)
  │     └─ deploy (Vercel CLI)
  └─ deploy_frontend.yml
        ├─ lint (Biome)
        └─ deploy (Vercel CLI)
```

### 環境

| 環境 | 用途 |
|------|------|
| production | 本番（`--prod`フラグ） |
| preview | プレビュー |

## 環境変数

### ローカル専用

| 変数 | 用途 |
|------|------|
| `API_PORT` | バックエンドポート（9999） |
| `POSTGRES_USER` / `PASSWORD` / `DB` | DB接続情報 |
| `POSTGRES_PORT` | DBポート（5432） |
| `DATABASE_URL` | DB接続URL |
| `FRONTEND_PORT` | フロントエンドポート（5173） |

### ローカル + 本番

| 変数 | 用途 |
|------|------|
| `JWT_SECRET_KEY` | JWT署名用秘密鍵 |
| `WEBAUTHN_RP_ID` | WebAuthn RP ID |
| `WEBAUTHN_RP_NAME` | WebAuthn RP名 |
| `FRONTEND_ORIGIN` | CORSオリジン |

### 本番専用

| 変数 | 用途 |
|------|------|
| `VITE_API_URL` | APIエンドポイントURL |
| `POSTGRES_URL` | Neon DB接続URL |
| `VERCEL_ENV` | `production`で本番DB接続 |
