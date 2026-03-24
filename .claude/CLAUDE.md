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
- クライアント: iPhoneのGoogle Chromeで「ホーム画面に追加」したWebアプリ利用が前提

## ルールファイル

### 開発規約
- [アーキテクチャ](rules/architecture.md) - レイヤド設計・ディレクトリ構造
- [バックエンド](rules/backend.md) - Python / FastAPI / SQLAlchemy 規約
- [フロントエンド](rules/frontend.md) - React / TypeScript / Tailwind CSS 規約
- [データベース](rules/database.md) - PostgreSQL / Alembic / 接続設定
- [開発フロー](rules/development.md) - lint・テスト必須プロセス
- [開発コマンド](rules/commands.md) - Makefile コマンド一覧
- [Git・デプロイ](rules/git.md) - Conventional Commits / GitHub Actions / Vercel

### アプリケーション仕様
- [プロダクトコンセプト](rules/concept.md) - ビジョン・ターゲット・設計思想
- [画面構成](rules/screens.md) - 画面一覧・遷移フロー・データ可視化
- [API仕様](rules/api.md) - エンドポイント・リクエスト・レスポンス
- [認証](rules/auth.md) - WebAuthn/パスキー + JWT フロー
- [データモデル](rules/data-model.md) - テーブル定義・ER図
- [インフラ・デプロイ](rules/infra.md) - Docker / CI/CD / Vercel / 環境変数
