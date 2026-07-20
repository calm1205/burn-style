# Spec: backend レイヤードアーキテクチャ移行

## 目的

- `backend/src/` の現行dir構成 (`api/schema/middleware/repository/service/model`)を
  `presentation/infrastructure/service/domain`の4層構成へ再編する
- 目的はディレクトリ構造の整理のみ。ビジネスロジック・API仕様・DBスキーマは一切変更しない
- 対象者: 本リポジトリを保守する開発者(将来的な可読性・責務把握のため)

## 前提 (今回のスコープ)

- **ディレクトリ移動 + import修正のみ**。層の責務違反
  (`categories.py`がrepositoryを直接呼ぶ、`auth.py`にWebAuthn検証ロジックが直書き等)は
  今回是正しない。既存の呼び出し関係はそのまま新パスへ移動する
- `model/` は `domain/` へ**そのまま置き換え** (ファイル名・中身は変更なし、ディレクトリ名のみ変更)
- `config.py` / `logger.py` / `main.py` は `src/` 直下に**現状維持** (どの層にも属さない横断的関心事として扱う)
- `service/` はディレクトリ名・配置ともに変更なし。内部importのみ新パスに追従
- `tests/` は `src/` の新構成に対称に追従させる (`tests/api/` → `tests/presentation/api/`、
  `tests/repository/` → `tests/infrastructure/`)
- 挙動・レスポンス・DBマイグレーション内容(alembic autogenerate diff)に変化がないことを最終確認する

## 新ディレクトリ構成

```
backend/src/
├── __init__.py
├── main.py                    # 現状維持 (composition root)
├── config.py                  # 現状維持
├── logger.py                  # 現状維持
├── domain/                    # ← model/ を置き換え
│   ├── __init__.py
│   ├── category.py
│   ├── expense.py
│   ├── expense_category_association.py
│   ├── recurring_expense.py
│   ├── user.py
│   ├── utils.py
│   ├── webauthn_challenge.py
│   └── webauthn_credential.py
├── infrastructure/             # ← repository/ を置き換え
│   ├── __init__.py
│   ├── database.py
│   ├── category_repository.py
│   ├── expense_repository.py
│   ├── recurring_expense_repository.py
│   ├── user_repository.py
│   ├── webauthn_challenge_repository.py
│   └── webauthn_repository.py
├── service/                    # 現状維持 (import pathのみ追従)
│   ├── __init__.py
│   ├── expense_service.py
│   ├── jwt_service.py
│   ├── recurring_expense_service.py
│   └── user_service.py
└── presentation/               # ← api/ + schema/ + middleware/ + api/deps.py を集約
    ├── __init__.py
    ├── deps.py
    ├── api/
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── categories.py
    │   ├── expenses.py
    │   ├── health.py
    │   ├── recurring_expenses.py
    │   └── users.py
    ├── schema/
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── category.py
    │   ├── expense.py
    │   ├── recurring_expense.py
    │   ├── types.py
    │   └── user.py
    └── middleware/
        ├── __init__.py
        ├── request_logging.py
        └── token_refresh.py

backend/tests/
├── conftest.py                 # 現状維持
├── presentation/
│   └── api/
│       ├── test_categories.py
│       ├── test_expenses.py
│       ├── test_health.py
│       ├── test_recurring_expenses.py
│       └── test_users.py
└── infrastructure/
    └── test_webauthn_challenge_repository.py

backend/alembic/env.py          # import先を新パスに更新 (Base / model のロード元)
```

## コードスタイル

import書き換えの例 (振る舞い変更なし、パスのみ):

```python
# Before
from src.model.user import User
from src.repository.database import get_db
from src.repository.user_repository import get_user_by_uuid
from src.api.deps import get_current_user

# After
from src.domain.user import User
from src.infrastructure.database import get_db
from src.infrastructure.user_repository import get_user_by_uuid
from src.presentation.deps import get_current_user
```

- ファイル移動は `git mv` を使い履歴を保持する
- 1コミットで一気に移動+import修正まで完了させる(中間状態でlint/testが壊れる期間を作らない)
- 各ファイル内の相対的なコード(関数定義・ロジック)は一切変更しない。変更差分はimport文とファイルパスのみ

## テスト戦略

- 既存テストの**内容は変更しない**。ディレクトリ移動とimport path修正のみ
- `tests/` は `src/` の新構成 (`presentation/`, `infrastructure/`) に対称なディレクトリへ追従
- 移動完了後、`make test-backend` (pytest -v) が全件成功することを必須条件とする
- `make lint` (mypy strict + ruff) がゼロエラーであることを必須条件とする
- `grep -rn "src\.model\|src\.repository\|src\.api\.\|src\.schema\|src\.middleware"` で
  旧パス参照が残っていないことを確認する

## 境界

- **常に行う**:
  - ファイル移動は `git mv` で履歴を保持
  - 移動後に `make lint` / `make test-backend` を実行し全緑を確認
  - 旧パスへの参照が残っていないことをgrepで確認
- **事前確認**:
  - 想定外の循環import等、機械的なパス置換だけでは解決できない問題が出た場合は対応方針を相談
- **絶対にしない**:
  - ビジネスロジックの変更 (関数の中身・分岐・戻り値を変えない)
  - APIレスポンス形式・エンドポイントpath・DBスキーマの変更
  - 層の責務違反の是正 (categories.pyのrepository直接呼び出し等は今回のスコープ外)
  - `config.py` / `logger.py` / `main.py` の移動
  - alembicのマイグレーションファイル新規生成 (autogenerate diffが出ないことを確認するのみ)

## 成功基準

- [ ] `backend/src/` が `presentation/infrastructure/service/domain` + 直下の
      `main.py/config.py/logger.py` の構成になっている
- [ ] `backend/tests/` が `src/` の新構成に対称なディレクトリ構成になっている
- [ ] 旧パス (`src.model` / `src.repository` / `src.api` / `src.schema` / `src.middleware`) への
      参照がリポジトリ内(backend配下)に一切残っていない (grep 0件)
- [ ] `make lint` がゼロエラーで通過
- [ ] `make test-backend` (pytest -v) が全件成功
- [ ] `cd backend && uv run alembic check` もしくは autogenerate 実行で
      スキーマ差分が検出されない (モデル変更が無いことの証明)
- [ ] API挙動 (レスポンス形式・ステータスコード) がリファクタ前後で無変更

## 未解決の問い

- なし (スコープ・model/config/loggerの扱いはユーザー確認済み)
