# インフラ & デプロイ

## デプロイ
- プラットフォーム: Vercel (フロントエンド + バックエンド)
- 本番 DB: Neon (PostgreSQL)
- CI/CD: GitHub Actions `workflow_dispatch` (手動トリガー)、production / preview 選択可
- ワークフロー: `deploy_backend.yml` / `deploy_frontend.yml`

## DB 接続の切り替え
- `VERCEL_ENV=production` → Neon
- それ以外 → ローカル Docker

## CORS

- CORS ヘッダは FastAPI ミドルウェアではなく `backend/vercel.json` (`headers`) 経由で Vercel エッジ層に設定
- OPTIONS preflight は `backend/src/main.py` のキャッチオールルートで 204 を返す (CORS ヘッダは Vercel が付与)
- `vercel.json` 内のフロントエンドオリジンはハードコード — 本番 URL が変わったらここを更新する

## 環境変数

### ローカル + 本番
| 変数 | 用途 |
|------|------|
| `JWT_SECRET_KEY` | JWT 署名シークレット (本番は32文字以上) |
| `WEBAUTHN_RP_ID` | WebAuthn RP ID |
| `WEBAUTHN_RP_NAME` | WebAuthn RP 名 |
| `FRONTEND_ORIGIN` | WebAuthn の register/sign-in 検証時の `expected_origin` (CORS には未使用 — それは `vercel.json` 側) |
| `CRON_SECRET` | `/cron/*` エンドポイント用 Bearer トークン (32文字以上推奨) |

### 本番のみ
| 変数 | 用途 |
|------|------|
| `VITE_API_URL` | API エンドポイント URL |
| `POSTGRES_URL` | Neon DB 接続 URL |
| `VERCEL_ENV` | `production` で本番 DB を選択 |
