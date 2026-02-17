.PHONY: help ruff mypy migrate upgrade downgrade revision seed db-clear db-reset db-connect upgrade-local downgrade-local revision-local upgrade-prod seed-prod db-clear-prod db-reset-prod

help: ## このヘルプメッセージを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


mypy: ## mypyで型チェックを実行
	uv run mypy .

ruff: ## ruffで自動修正可能な問題を修正
	uv run ruff check --fix .

lint: ## mypy & ruff
	make mypy
	make ruff

upgrade: ## データベースを最新バージョンにアップグレード
	uv run alembic upgrade head

downgrade: ## データベースを1つ前のバージョンにダウングレード
	uv run alembic downgrade -1

MESSAGE ?= "auto migration"
revision: ## 新しいマイグレーションファイルを作成（使用例: make revision MESSAGE="create table"）
	uv run alembic revision --autogenerate -m "$(MESSAGE)"

seed: ## User テーブルに seed データを投入
	uv run python scripts/seed_all.py

db-clear: ## データベースを完全にリセット
	rm -f alembic/versions/*
	docker compose down -v

db-reset: ## データベースを完全にリセット
	make db-clear
	docker compose up -d db
	sleep 1
	make revision MESSAGE="initial"
	make upgrade
	make seed

db-connect: ## PostgreSQL CLIに接続
	docker compose exec db sh -c 'psql -U $$POSTGRES_USER $$POSTGRES_DB'

upgrade-prod: ## Neon本番DBにマイグレーション実行
	VERCEL_ENV=production uv run alembic upgrade head

seed-prod: ## Neon本番DBにseedデータを投入
	VERCEL_ENV=production uv run python scripts/seed_all.py

db-clear-prod: ## Neon本番DBの全テーブルを削除
	VERCEL_ENV=production uv run alembic downgrade base

db-reset-prod: ## Neon本番DBをリセットしてseedデータを投入
	make db-clear-prod
	make upgrade-prod
	make seed-prod
