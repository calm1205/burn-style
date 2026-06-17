# BurnStyle - プロジェクトガイドライン

## 言語ポリシー
- リポジトリ内のテキスト (コード・コメント・ドキュメント・コミットメッセージ) は英語で記述する
- **例外1**: JSDoc / Python docstring は日本語 (簡潔に1〜2行、WHY 中心)
- **例外2**: `.claude/` 配下の Claude 向け指示ファイル (本ファイル含む) は日本語

## 実装ポリシー
- **シンプルさを最優先**
- 最小限のコードで要件を満たす
- 不要な抽象化・オーバーエンジニアリングを避ける
- 迷ったらシンプルな方を選ぶ

## 概要
- 家計簿アプリ (フルスタック)
- バックエンド: FastAPI + SQLAlchemy + PostgreSQL
- フロントエンド: React + Vite + Tailwind CSS v4
- 認証: WebAuthn/Passkey + JWT
- クライアント: iPhone の Google Chrome からホーム画面に追加した Web アプリ

## ルールファイル

- [プロダクトコンセプト](rules/concept.md) - ビジョン・対象ユーザー・デザイン哲学
- [バックエンド](rules/backend.md) - Python コーディング規約
- [フロントエンド](rules/frontend.md) - TypeScript / React コーディング規約
- [開発フロー](rules/development.md) - 必須の lint / test プロセス
- [Git](rules/git.md) - Conventional Commits / コミット言語
- [インフラ](rules/infra.md) - デプロイ先・環境変数

> アーキテクチャ・スキーマ・エンドポイント・画面・コマンドは直接コードベース (`backend/src/`, `frontend/src/`, `Makefile`, `docker-compose.yml`) から読み取る。
