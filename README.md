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
