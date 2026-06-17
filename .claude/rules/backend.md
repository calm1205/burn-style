# バックエンド規約

## Python バージョン
- `backend/.python-version` と `backend/pyproject.toml` の `requires-python = ">=3.12"` で **3.12** に固定
- Vercel の Python ランタイムが 3.13+ をサポートするまでアップグレード禁止 — 現状 Vercel は 3.12 までサポートで、不一致は本番で `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'` を引き起こす (CI がバンドルする cp3XX wheel が Vercel ランタイム ABI でロード失敗する)
- アップグレードが必要な場合は `.python-version` と `pyproject.toml` を同時に変更し、`cd backend && uv lock` で wheel を再生成する

## コーディング規約
- 各ファイル先頭に `from __future__ import annotations` を追加
- **UUID**: uuid6 (v7) を使用、ハイフン無し32文字
- **削除**: `deleted_at` カラムによる論理削除
- `print()` は `scripts/` ディレクトリ内でのみ許可

## ロギング
- アプリケーションコードでは `src.logger.get_logger(name)` を使用 — `print()` は禁止
- 構造化データは `extra={...}` で渡す (例: `logger.info("user signed in", extra={"event": "signin"})`)
- `request_id` と `user_uuid` は contextvars から自動注入されるため明示的に渡さない

## mypy / ruff
- mypy strict モード必須、全ての関数・変数に型注釈
- ruff の行長: 120

## 日付 / 時刻
- 「JST の今日」は `datetime.now(JST).date()` を使う — `date.today()` は OS のタイムゾーンに依存するため禁止
- `python-dateutil` は `relativedelta` (月計算) のみ許可。`dateutil.parser` は禁止
- 繰り返しスケジュールは `start_date + n × interval` から計算 — 月末のずれを防ぐため「前回 + interval」の連鎖はしない
