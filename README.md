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

環境変数`API_PORT`で設定されたポートでアクセスできます（デフォルト: 9999）

- API: http://localhost:${API_PORT}
- API Docs: http://localhost:${API_PORT}/docs
- ReDoc: http://localhost:${API_PORT}/redoc

## データベース接続

`.env`ファイルで以下の環境変数を設定してください：

- `POSTGRES_USER`: データベースユーザー名
- `POSTGRES_PASSWORD`: データベースパスワード
- `POSTGRES_DB`: データベース名
- `POSTGRES_PORT`: データベースポート（デフォルト: 5432）

接続情報は`.env`ファイルの`DATABASE_URL`で確認できます。

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
