# Finance API

FastAPI + PostgreSQL アプリケーション

## セットアップ

1. 環境変数ファイルを作成

```bash
cp .env.example .env
```

2. Docker Compose Watch で起動

```bash
docker compose watch
```

または通常の起動

```bash
docker compose up -d
```

## アクセス

- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## データベース接続

- ホスト: localhost
- ポート: 5432
- データベース名: finance
- ユーザー名: postgres
- パスワード: postgres

## 開発

`docker compose watch`を使用すると、コード変更が自動的に反映されます。

## パッケージ管理

このプロジェクトでは`uv`を使用してパッケージ管理を行います。

### 依存関係の追加

```bash
uv add <package-name>
```

### 依存関係の更新

```bash
uv lock
```

### ローカル環境での依存関係インストール

```bash
uv sync
```
