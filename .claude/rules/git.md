# Git & デプロイガイドライン

## コミットメッセージ
- Conventional Commits 形式: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:` 等
- 英語で記述

## デプロイ
- **プラットフォーム**: Vercel
- **トリガー**: GitHub Actions `workflow_dispatch` (手動実行)
- **環境**: production / preview から選択

## GitHub Actions ワークフロー
| ファイル | 対象 |
|---------|------|
| `deploy_backend.yml` | バックエンドデプロイ |
| `deploy_frontend.yml` | フロントエンドデプロイ |

## デプロイフロー
1. GitHub Actions タブから手動でトリガー
2. 環境を選択 (production / preview)
3. Vercel CLI 経由でビルド・デプロイ
