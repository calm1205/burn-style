# バックエンド規約

## 技術スタック
- **言語**: Python 3.14
- **パッケージ管理**: uv
- **フレームワーク**: FastAPI
- **ORM**: SQLAlchemy 2.x
- **バリデーション**: Pydantic
- **型チェック**: mypy (strict モード)
- **リンター/フォーマッター**: ruff (行長120文字)

## コーディング規約
- `from __future__ import annotations` を各ファイル先頭に追加
- **UUID**: uuid6 (v7) を使用、32文字ハイフンなし
- **削除**: 論理削除 (`deleted_at` カラム)
- `scripts/` 配下のみ `print()` 使用可
- `.env` はコミット禁止（`.env.template` を使用）

## mypy
- strict モード必須
- 型アノテーションを全関数・変数に付与

## ruff
- 行長: 120文字
- `ruff check --fix .` で自動修正
