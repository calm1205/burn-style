# BurnStyle - プロジェクト規約

## 実装方針
- **シンプルであることを最優先とする**
- 最小限のコードで要件を満たす
- 不要な抽象化・過度な設計を避ける
- 迷ったらシンプルな方を選ぶ

## 概要
- 家計管理アプリ（フルスタック）
- バックエンド: FastAPI + SQLAlchemy + PostgreSQL
- フロントエンド: React + Vite + Tailwind CSS v4
- 認証: WebAuthn/パスキー + JWT

## ルールファイル
- [アーキテクチャ](rules/architecture.md) - レイヤド設計・ディレクトリ構造
- [バックエンド](rules/backend.md) - Python / FastAPI / SQLAlchemy 規約
- [フロントエンド](rules/frontend.md) - React / TypeScript / Tailwind CSS 規約
- [データベース](rules/database.md) - PostgreSQL / Alembic / 接続設定
- [開発フロー](rules/development.md) - lint・テスト必須プロセス
- [開発コマンド](rules/commands.md) - Makefile コマンド一覧
- [Git・デプロイ](rules/git.md) - Conventional Commits / GitHub Actions / Vercel
