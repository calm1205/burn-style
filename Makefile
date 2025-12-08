.PHONY: help lint format check fix migrate upgrade downgrade revision seed db-clear

help: ## このヘルプメッセージを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## ruffでコードをチェック
	uv run ruff check .

format: ## ruffでコードをフォーマット
	uv run ruff format .

fix: ## ruffで自動修正可能な問題を修正
	uv run ruff check --fix .

migrate: ## マイグレーションを実行（upgradeのエイリアス）
	docker compose exec api uv run alembic upgrade head

upgrade: ## データベースを最新バージョンにアップグレード
	docker compose exec api uv run alembic upgrade head

downgrade: ## データベースを1つ前のバージョンにダウングレード
	docker compose exec api uv run alembic downgrade -1

revision: ## 新しいマイグレーションファイルを作成（使用例: make revision MESSAGE="create table"）
	docker compose exec api uv run alembic revision --autogenerate -m "$(MESSAGE)"

seed: ## User テーブルに seed データを投入
	docker compose exec api uv run python scripts/seed_users.py

db-clear: ## データベースをクリア（すべてのマイグレーションを元に戻して再適用）
	docker compose exec api uv run alembic downgrade base
	docker compose exec api uv run alembic upgrade head