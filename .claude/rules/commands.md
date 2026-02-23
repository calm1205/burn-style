# 開発コマンド

## 起動
| コマンド | 説明 |
|---------|------|
| `docker compose watch` | ローカル開発起動（ホットリロード） |

## Lint
| コマンド | 説明 |
|---------|------|
| `make lint` | backend (mypy + ruff) + frontend (biome) 実行 |
| `make mypy` | mypy型チェック |
| `make ruff` | ruff自動修正 |
| `make biome` | Biomeチェック（frontend） |

## テスト
| コマンド | 説明 |
|---------|------|
| `make test-backend` | backendのテスト実行 |

## データベース（ローカル）
| コマンド | 説明 |
|---------|------|
| `make revision MESSAGE="説明"` | マイグレーション作成 |
| `make upgrade` | マイグレーション適用 |
| `make downgrade` | 1つ前にダウングレード |
| `make seed` | seedデータ投入 |
| `make db-clear` | DB完全クリア（volumes削除） |
| `make db-reset` | DB完全リセット + seed |
| `make db-connect` | PostgreSQL CLIに接続 |

## データベース（本番 Neon）
| コマンド | 説明 |
|---------|------|
| `make upgrade-prod` | 本番DBにマイグレーション実行 |
| `make seed-prod` | 本番DBにseedデータ投入 |
| `make db-clear-prod` | 本番DBの全テーブル削除 |
| `make db-reset-prod` | 本番DBリセット + seed |
