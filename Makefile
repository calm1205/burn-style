.PHONY: lint test-backend migrate upgrade seed db-clear db-connect prod-upgrade prod-seed

BACKEND_DIR = backend
FRONTEND_DIR = frontend

lint: ## backend(mypy & ruff) + frontend(typecheck & biome)
	cd $(BACKEND_DIR) && uv run mypy .
	cd $(BACKEND_DIR) && uv run ruff check --fix .
	cd $(FRONTEND_DIR) && npm run typecheck
	cd $(FRONTEND_DIR) && npx biome check .

test-backend: ## backendのテストを実行
	cd $(BACKEND_DIR) && uv run pytest -v

upgrade: ## データベースを最新バージョンにアップグレード
	cd $(BACKEND_DIR) && uv run alembic upgrade head

SEED_USER ?=
seed: ## seedデータを投入（使用例: make seed SEED_USER="username"）
	cd $(BACKEND_DIR) && uv run python scripts/seed_all.py $(SEED_USER)

db-clear: ## データベースの全テーブルを削除
	@echo "全テーブルを削除します。よろしいですか? [y/N]" && read ans && [ "$$ans" = "y" ] || (echo "中止" && exit 1)
	docker compose exec db sh -c 'psql -U $$POSTGRES_USER $$POSTGRES_DB -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"'

db-connect: ## PostgreSQL CLIに接続
	docker compose exec db sh -c 'psql -U $$POSTGRES_USER $$POSTGRES_DB'

prod-upgrade: ## Neon本番DBにマイグレーション実行
	cd $(BACKEND_DIR) && VERCEL_ENV=production uv run alembic upgrade head

prod-seed: ## Neon本番DBにseedデータを投入（使用例: make prod-seed SEED_USER="username"）
	cd $(BACKEND_DIR) && VERCEL_ENV=production uv run python scripts/seed_all.py $(SEED_USER)
