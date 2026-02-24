.PHONY: init help ruff mypy biome lint test-backend migrate upgrade revision seed db-clear db-reset db-connect upgrade-local downgrade-local revision-local upgrade-prod seed-prod db-clear-prod db-reset-prod

BACKEND_DIR = backend
FRONTEND_DIR = frontend

init: ## プロジェクトの初期セットアップ
	cp .env.template .env
	uv venv --python 3.14.0
	uv sync --all-groups
	docker compose watch

help: ## このヘルプメッセージを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


mypy: ## mypyで型チェックを実行
	cd $(BACKEND_DIR) && uv run mypy .

ruff: ## ruffで自動修正可能な問題を修正
	cd $(BACKEND_DIR) && uv run ruff check --fix .

biome: ## biomeでフロントエンドのlint・formatチェックを実行
	cd $(FRONTEND_DIR) && npx biome check .

lint: ## backend(mypy & ruff) + frontend(biome)
	make mypy
	make ruff
	make biome

test-backend: ## backendのテストを実行
	cd $(BACKEND_DIR) && uv run pytest -v

upgrade: ## データベースを最新バージョンにアップグレード
	cd $(BACKEND_DIR) && uv run alembic upgrade head

MESSAGE ?= "auto migration"
revision: ## 新しいマイグレーションファイルを作成（使用例: make revision MESSAGE="create table"）
	cd $(BACKEND_DIR) && uv run alembic revision --autogenerate -m "$(MESSAGE)"

seed: ## User テーブルに seed データを投入
	cd $(BACKEND_DIR) && uv run python scripts/seed_all.py

db-clear: ## データベースの全テーブルを削除
	cd $(BACKEND_DIR) && uv run alembic downgrade base

db-reset: ## データベースをリセットしてseedデータを投入
	make db-clear
	make upgrade
	make seed

db-connect: ## PostgreSQL CLIに接続
	docker compose exec db sh -c 'psql -U $$POSTGRES_USER $$POSTGRES_DB'

upgrade-prod: ## Neon本番DBにマイグレーション実行
	cd $(BACKEND_DIR) && VERCEL_ENV=production uv run alembic upgrade head

seed-prod: ## Neon本番DBにseedデータを投入
	cd $(BACKEND_DIR) && VERCEL_ENV=production uv run python scripts/seed_all.py

db-clear-prod: ## Neon本番DBの全テーブルを削除
	cd $(BACKEND_DIR) && VERCEL_ENV=production uv run alembic downgrade base

db-reset-prod: ## Neon本番DBをリセットしてseedデータを投入
	make db-clear-prod
	make upgrade-prod
	make seed-prod
