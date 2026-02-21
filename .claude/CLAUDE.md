# Finance API - プロジェクト規約

## 概要
- 家計管理API
- FastAPI + SQLAlchemy + PostgreSQL
- Python 3.14 / uv

## アーキテクチャ
- レイヤド設計: `src/api/` → `src/service/` → `src/repository/` → `src/model/`
- Pydanticスキーマ: `src/schema/`
- エントリーポイント: `src/main.py`

## 技術スタック
- **フレームワーク**: FastAPI
- **ORM**: SQLAlchemy 2.x
- **DB**: PostgreSQL (ローカル: Docker / 本番: Neon)
- **マイグレーション**: Alembic (autogenerate)
- **パッケージ管理**: uv
- **デプロイ**: Vercel (GitHub Actions workflow_dispatch)

## 開発コマンド
- `docker compose watch` - ローカル開発起動
- `make lint` - mypy + ruff 実行
- `make revision MESSAGE="説明"` - マイグレーション作成
- `make upgrade` - マイグレーション適用
- `make seed` - seedデータ投入
- `make db-reset` - DB完全リセット + seed

## コーディング規約
- **型チェック**: mypy strict モード必須
- **リンター/フォーマッター**: ruff (行長120文字)
- **UUID**: uuid6 (v7) を使用、32文字ハイフンなし
- **削除**: 論理削除 (deleted_at)
- **DB接続**: `VERCEL_ENV=production` → Neon / それ以外 → ローカルDocker

## コミットメッセージ
- Conventional Commits形式: `feat:`, `fix:`, `chore:` 等
- 日本語で記述

## 注意事項
- `scripts/` 配下のみ `print()` 使用可
- `from __future__ import annotations` を各ファイルに追加
- `.env` はコミット禁止 (`.env.template` を使用)
