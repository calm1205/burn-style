.PHONY: lint format check fix

lint: ## ruffでコードをチェック
	uv run ruff check .

format: ## ruffでコードをフォーマット
	uv run ruff format .

fix: ## ruffで自動修正可能な問題を修正
	uv run ruff check --fix .