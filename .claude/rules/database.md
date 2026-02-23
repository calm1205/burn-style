# データベース規約

## 技術スタック
- **DB**: PostgreSQL
- **ORM**: SQLAlchemy 2.x
- **マイグレーション**: Alembic (autogenerate)

## 接続先切替
- `VERCEL_ENV=production` → Neon（本番）
- それ以外 → ローカルDocker

## ローカル開発
- `docker compose up -d db` でPostgreSQL起動
- `docker compose watch` で全サービス起動（ホットリロード対応）
- `docker compose exec db sh -c 'psql -U $POSTGRES_USER $POSTGRES_DB'` でCLI接続

## Alembic
- `--autogenerate` でモデルからマイグレーション自動生成
- マイグレーションファイル: `backend/alembic/versions/`
- `db-reset` 時はversionsディレクトリをクリアして再生成
