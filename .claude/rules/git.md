# Git・デプロイ規約

## コミットメッセージ
- Conventional Commits形式: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:` 等
- 日本語で記述

## デプロイ
- **プラットフォーム**: Vercel
- **トリガー**: GitHub Actions `workflow_dispatch`（手動実行）
- **環境**: production / preview を選択可能

## GitHub Actions ワークフロー
| ファイル | 対象 |
|---------|------|
| `deploy_backend.yml` | バックエンドデプロイ |
| `deploy_frontend.yml` | フロントエンドデプロイ |

## デプロイフロー
1. GitHubのActionsタブから手動実行
2. 環境（production / preview）を選択
3. Vercel CLIでビルド＆デプロイ
