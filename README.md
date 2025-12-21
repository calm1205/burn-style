# Finance API

## setup

```bash
cp .env.template .env
uv venv --python 3.14.0
uv sync --all-group
docker compose watch
```

## アクセス

環境変数`API_PORT`で設定されたポートでアクセスできます（デフォルト: 9999）

- API: http://localhost:${API_PORT}
- API Docs: http://localhost:${API_PORT}/docs
- ReDoc: http://localhost:${API_PORT}/redoc
