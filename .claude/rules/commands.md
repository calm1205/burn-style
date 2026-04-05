# 開発コマンド

## 起動
| コマンド | 説明 |
|---------|------|
| `docker compose watch` | ローカル開発起動（ホットリロード） |

## Lint
| コマンド | 説明 |
|---------|------|
| `make lint` | backend (mypy + ruff) + frontend (biome) 実行 |

## テスト
| コマンド | 説明 |
|---------|------|
| `make test-backend` | backendのテスト実行 |

## データベース（ローカル）
| コマンド | 説明 |
|---------|------|
| `make upgrade` | マイグレーション適用 |
| `make downgrade` | 1つ前にダウングレード |
| `make seed` | seedデータ投入（`SEED_USER="名前"` でユーザー指定可） |
| `make db-clear` | DB完全クリア（volumes削除） |
| `make db-connect` | PostgreSQL CLIに接続 |

## データベース（本番 Neon）
| コマンド | 説明 |
|---------|------|
| `make prod-upgrade` | 本番DBにマイグレーション実行 |
