# Git & デプロイガイドライン

## コミットメッセージ
- Conventional Commits 形式: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:` 等
- 英語で記述

## デプロイ
- **プラットフォーム**: Vercel
- **トリガー**: Release PR フローのみ（手動 `deploy.yml` は廃止）
- **環境**: production のみ（Release PR マージ時に自動デプロイ）

## GitHub Actions ワークフロー
| ファイル | 対象 |
|---------|------|
| `release_pr.yml` | `development` → `main` の Release PR 作成 |
| `release.yml` | Release PR マージ時のタグ・GitHub Release 作成 + production デプロイ |
| `deploy_backend.yml` | バックエンドデプロイ（再利用、`release.yml` から呼び出し） |
| `deploy_frontend.yml` | フロントエンドデプロイ（再利用、`release.yml` から呼び出し） |

## デプロイフロー
1. GitHub Actions から `Release PR` ワークフローを手動実行
2. `development` → `main` の Release PR を作成（未作成の場合）
3. PR に `major` / `minor` / `patch` ラベルを付与（未指定時は minor）
4. Release PR を `main` にマージ
5. `release.yml` が semver タグ・GitHub Release 作成後、`deploy_backend.yml` / `deploy_frontend.yml` で production デプロイ
