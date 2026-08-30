# Spec: Expense VIBE 構造化

## 前提

- 対象は VIBE 3軸（social / planning / necessity）の表現変更と、それに伴う API・frontend・export/import・定期支出連携
- VIBE は支出の独立属性3つではなく、1つの複合概念として扱う
- DB 物理構造は既存3カラム（`vibe_social` / `vibe_planning` / `vibe_necessity`）を維持し、API 層でネストオブジェクトへマッピングする（マイグレーション最小化）
- 定期支出（`RecurringExpense`）にも VIBE を持たせ、自動生成 Expense へ伝播する
- 既存 SPEC（recurring expense 命名リファクタ）は完了済み。本スペックが現行の唯一の真実の源
- ユーザーは burn-style の記帳者（本人）。export JSON を分析・バックアップ用途で利用
- 現行 frontend の新規記帳デフォルト（SOLO / ROUTINE / NEEDED）は維持

## 目的

### 背景

- 現状 `vibe_social` / `vibe_planning` / `vibe_necessity` が Expense トップレベルにフラット配置され、一体性が型・スキーマ上で表現されない
- 軸ごとの部分 null（DB 上92件）が「未入力」と区別しにくく、export 上もノイズになる
- 定期支出の自動生成（58件）が VIBE 未設定のまま Expense を作る実装漏れがある

### 何を作るか

1. API レスポンス・リクエスト・export/import を `vibe: Vibe | null` 形式へ統一
2. ドメイン／スキーマ層に `Vibe` 値オブジェクト（Pydantic / TypeScript）を導入
3. `RecurringExpense` に VIBE を追加し、`record_occurrences` で Expense へコピー
4. export/import を新形式 `vibe` オブジェクトのみとする（旧形式互換なし）

### ユーザーストーリー

- 記帳者として、支出の VIBE を1つのまとまりとして認識・編集したい
- 記帳者として、定期支出から生成された記録にも VIBE が付いていることを期待する
- 記帳者として、export JSON がアプリ上の VIBE 表示と一致することを期待する

### 成功とは

- API・export・UI が同一の `vibe` 構造を共有し、意味的に一貫している
- 2026-08-29 以降の手動記帳と同様、新規記帳・定期生成で VIBE が欠落しない
- 未設定 VIBE は API/export 上 `vibe: null` として一貫表示（既存 DB 行の書き換えは行わない）

## 目標スキーマ

### API / export（新形式）

```json
{
  "uuid": "...",
  "name": "ランチ",
  "amount": 427,
  "vibe": {
    "social": "SOLO",
    "planning": "ROUTINE",
    "necessity": "NEEDED"
  }
}
```

VIBE 未設定時:

```json
{
  "vibe": null
}
```

### 型定義（frontend）

```typescript
export type VibeSocial = "SOLO" | "WITH_SOMEONE"
export type VibePlanning = "ROUTINE" | "SPONTANEOUS"
export type VibeNecessity = "NEEDED" | "WANTED"

export interface Vibe {
  social: VibeSocial
  planning: VibePlanning
  necessity: VibeNecessity
}

export interface ExpenseResponse {
  // ...
  vibe: Vibe | null
}
```

### 型定義（backend schema）

```python
class Vibe(BaseModel):
    social: VibeSocial
    planning: VibePlanning
    necessity: VibeNecessity

class ExpenseResponse(BaseModel):
    # ...
    vibe: Vibe | None

    @classmethod
    def from_expense(cls, expense: Expense) -> ExpenseResponse:
        vibe = expense_to_vibe(expense)  # 3軸いずれか null → None
        ...
```

### DB（変更なし — マッピングのみ）

| DB カラム | Vibe フィールド |
|-----------|-----------------|
| `vibe_social` | `social` |
| `vibe_planning` | `planning` |
| `vibe_necessity` | `necessity` |

### VIBE 完全性ルール（推奨）

| 操作 | ルール |
|------|--------|
| POST /expenses | `vibe` 省略または `null` → DB 3軸 null。`vibe` オブジェクト → 3軸すべて必須 |
| PATCH /expenses | `vibe: null` → 3軸クリア。`vibe: {...}` → 3軸すべて必須。部分更新不可 |
| GET / export | 3軸すべて非 null のみ `vibe` オブジェクト。それ以外は `vibe: null` |
| 定期支出 | 作成時に `vibe` 必須（デフォルト SOLO/ROUTINE/NEEDED） |

部分 null（DB 既存92件）は **レスポンス上 `vibe: null` として扱う**。DB 値はそのまま残し、ユーザーが編集保存した時点で完全オブジェクトへ正規化。

## コードスタイル

### backend: マッピング関数を1箇所に集約

```python
# src/domain/vibe.py（新規）
@dataclass(frozen=True)
class Vibe:
    social: VibeSocial
    planning: VibePlanning
    necessity: VibeNecessity

def expense_to_vibe(expense: Expense) -> Vibe | None:
    if expense.vibe_social is None or expense.vibe_planning is None or expense.vibe_necessity is None:
        return None
    return Vibe(
        social=expense.vibe_social,
        planning=expense.vibe_planning,
        necessity=expense.vibe_necessity,
    )

def apply_vibe_to_expense(expense: Expense, vibe: Vibe | None) -> None:
    if vibe is None:
        expense.vibe_social = None
        expense.vibe_planning = None
        expense.vibe_necessity = None
        return
    expense.vibe_social = vibe.social
    expense.vibe_planning = vibe.planning
    expense.vibe_necessity = vibe.necessity
```

### backend: Pydantic スキーマ

```python
class ExpenseCreate(BaseModel):
    name: str
    amount: int
    expensed_at: JstInputDatetime
    category_uuid: str | None = None
    vibe: Vibe | None = None
```

旧キー `vibe_social` 等は **公開 API・import ともに削除**。新形式 `vibe` のみ受け付ける。

### frontend: form draft

```typescript
export interface ExpenseFormDraft {
  name: string
  amount: string
  expensedAt: string
  categoryUuid: string | null
  vibe: Vibe  // 新規記帳は常に完全オブジェクト（デフォルト値付き）
}
```

フィルタは内部 state を `vibeSocial` 等のまま維持してよい。API 境界のみ `Vibe` 型に統一。

### 命名規約

- API JSON キー: `snake_case`（`vibe.social` は camelCase にならない — nested も snake_case）
- TypeScript 内部: `Vibe` interface + `vibe` プロパティ
- DB カラム: 既存 `vibe_*` を維持（リネームしない）
- マッピング関数: `expense_to_vibe` / `apply_vibe_to_expense`

## テスト戦略

### backend

| 対象 | テスト | ファイル |
|------|--------|----------|
| Vibe マッピング | 3軸完備 → オブジェクト、部分 null → None | `tests/domain/test_vibe.py`（新規） |
| Expense CRUD API | create/update/get が `vibe` ネスト形式 | `tests/presentation/api/test_expenses.py` |
| export/import | 新形式 export/import のみ | `tests/presentation/api/test_users_export_import.py`（新規または既存拡張） |
| 定期支出 | 作成時 vibe 保存、record 時 Expense へ伝播 | `tests/presentation/api/test_recurring_expenses.py` |

### frontend

| 対象 | テスト | ファイル |
|------|--------|----------|
| フィルタ | `expense.vibe?.social` 参照へ更新 | `expenseFilter.test.ts` |
| API 型 | コンパイルエラーで検出（型変更に追随） | — |

### 完了時コマンド

- `make lint` ゼロエラー
- `make test-backend` 全件成功
- `make test-frontend` 全件成功

## 境界

### 常に行う

- API 公開面では `vibe` ネスト形式のみ（フラット3キーをレスポンスに出さない）
- マッピング関数を repository / schema から直書きしない — `domain/vibe.py` 経由
- コミット前に lint + test 実行
- oxfmt / ruff / mypy 準拠

### 事前確認

- `recurring_expenses` テーブルへの3カラム追加（Alembic マイグレーション）

### 絶対にしない

- DB 3カラムを JSON カラム1本に統合（スコープ外）
- 旧 API キー（`vibe_social` 等）を GET レスポンスに残す（二重表現）
- 部分 null の `vibe: { social: "SOLO", planning: null, ... }` を新 API で許容
- 秘匿情報のコミット

## 成功基準

- [ ] `GET /expenses` / `GET /expenses/{uuid}` のレスポンスに `vibe` オブジェクトがあり、`vibe_social` 等のフラットキーが存在しない
- [ ] `POST /PATCH /expenses` が `vibe` ネスト形式のみ受け付ける
- [ ] export JSON が `"vibe": { "social": ..., "planning": ..., "necessity": ... }` 形式
- [ ] import が新形式を正しく復元する
- [ ] DB 上3軸のいずれかが null の Expense は API 上 `vibe: null` を返す（既存行の DB 更新は行わない）
- [ ] `RecurringExpense` CRUD が `vibe` を持つ
- [ ] `record_occurrences` が生成 Expense に recurring の vibe をコピーする
- [ ] frontend 新規記帳・編集・フィルタが `vibe` 型で動作する
- [ ] `make lint` ゼロエラー
- [ ] `make test-backend` / `make test-frontend` 全件成功

## 確定事項

| # | 論点 | 決定 |
|---|------|------|
| 1 | 部分 null の既存92件 | DB 行はそのまま。API/export は `vibe: null`（**DBバックフィルしない**） |
| 2 | 定期生成済み58件 | 過去 Expense はそのまま `vibe: null`。今後の `record_occurrences` のみ伝播 |
| 3 | export/import 互換 | 旧形式（`vibe_social` 等）の読み取りフォールバック**不要** |
| 4 | RecurringExpense | 作成時 `vibe` 必須。デフォルト SOLO / ROUTINE / NEEDED |

### DBバックフィルとは（参考）

Alembic data migration で既存行の null カラムを一括でデフォルト値（例: SOLO/ROUTINE/NEEDED）に**書き換える**こと。本スペックでは採用しない。未設定は DB も API も null のままとし、レスポンス変換時に3軸いずれか欠けていれば `vibe: null` とするのみ。

---

## Plan（実装計画）

### コンポーネントと依存関係

```
domain/vibe.py          ← 新規。マッピングの単一真実源
    ↑
presentation/schema/    ← ExpenseResponse, ExpenseCreate, ImportExpense, RecurringExpense*
    ↑
service/                ← expense_service, recurring_expense_service, user_service
    ↑
infrastructure/         ← expense_repository, recurring_expense_repository（DB書き込み）
    ↑
frontend/types + hooks + filter
```

### 実装順序

| Phase | 内容 | 依存 |
|-------|------|------|
| 1 | `domain/vibe.py` + 単体テスト | なし |
| 2 | Expense API schema 変更 + API テスト更新 | Phase 1 |
| 3 | export/import schema 新形式化 + テスト | Phase 2 |
| 4 | `RecurringExpense` DB マイグレーション + schema + API | Phase 1 |
| 5 | `record_occurrences` vibe 伝播 + テスト | Phase 4 |
| 6 | frontend 型・hooks・filter・form 更新 + テスト | Phase 2, 5 |
| 7 | 手動確認（記帳・編集・export・定期生成） | Phase 6 |

### リスクと緩和

| リスク | 緩和 |
|--------|------|
| frontend / backend 型不一致 | Phase 2 完了後に frontend 型を一括更新。OpenAPI 生成があれば活用 |
| 旧 export JSON が import 不可 | 破壊的変更として許容。ユーザーは新形式 export から再バックアップ |
| 部分 null データの表示 | 仕様上 `vibe: null`。ユーザー編集保存時に完全オブジェクトへ正規化 |
| マイグレーション失敗 | recurring への nullable 3カラム追加のみ。既存行は null 許容 |

### 並行可能 / 逐次

- **並行可**: Phase 2（Expense API）と Phase 4（Recurring DB + schema）は Phase 1 後に並行
- **逐次必須**: Phase 5 は Phase 4 完了後。Phase 6 は Phase 2 + 5 完了後

### 検証チェックポイント

1. Phase 2 後: `curl` / API テストで Expense CRUD が `vibe` 形式
2. Phase 3 後: 新形式 export → import で vibe が復元されること
3. Phase 5 後: 定期 record で Expense.vibe が設定されること（過去分は null のまま）
4. Phase 7 後: ブラウザで記帳→一覧→export の一連確認

---

## Tasks（タスク分解）

### Phase 1: ドメインマッピング

- [ ] Task: `domain/vibe.py` に `Vibe` dataclass とマッピング関数を追加
  - Acceptance: 3軸完備 → `Vibe`、いずれか null → `None`。逆方向 `apply_vibe_to_expense` も動作
  - Verify: `pytest tests/domain/test_vibe.py`
  - Files: `backend/src/domain/vibe.py`, `backend/tests/domain/test_vibe.py`

### Phase 2: Expense API

- [ ] Task: Pydantic schema を `vibe: Vibe | None` へ変更
  - Acceptance: `ExpenseResponse` / `ExpenseCreate` / `ExpenseUpdate` がネスト形式。`from_expense` または model_validator でマッピング
  - Verify: `pytest tests/presentation/api/test_expenses.py`
  - Files: `backend/src/presentation/schema/expense.py`, `backend/src/presentation/api/expenses.py`, `backend/src/service/expense_service.py`, `backend/src/infrastructure/expense_repository.py`, `backend/tests/presentation/api/test_expenses.py`

### Phase 3: export/import

- [ ] Task: export/import schema を新形式 `vibe` に統一
  - Acceptance: export/import とも `vibe` ネスト形式のみ。旧フラットキー非対応
  - Verify: API テストで新形式 export → import ラウンドトリップ
  - Files: `backend/src/presentation/schema/user.py`, `backend/src/service/user_service.py`, `backend/tests/presentation/api/test_users*.py`

### Phase 4: RecurringExpense vibe 追加

- [ ] Task: Alembic マイグレーション + RecurringExpense schema/API
  - Acceptance: recurring CRUD が `vibe` を持つ。DB に3カラム追加
  - Verify: `pytest tests/presentation/api/test_recurring_expenses.py`
  - Files: `backend/alembic/versions/*_add_recurring_vibe.py`, `backend/src/domain/recurring_expense.py`, `backend/src/presentation/schema/recurring_expense.py`, `backend/src/presentation/api/recurring_expenses.py`, `backend/src/infrastructure/recurring_expense_repository.py`

### Phase 5: 定期生成への伝播

- [ ] Task: `record_occurrences` で vibe コピー
  - Acceptance: 自動生成 Expense の3軸が recurring の vibe と一致
  - Verify: recurring API テスト
  - Files: `backend/src/service/recurring_expense_service.py`, `backend/tests/presentation/api/test_recurring_expenses.py`

### Phase 6: frontend

- [ ] Task: TypeScript 型・API client・form hooks 更新
  - Acceptance: 新規記帳・編集が `vibe` オブジェクトで POST/PATCH。コンパイルエラーなし
  - Verify: `make test-frontend`
  - Files: `frontend/src/common/libs/types.ts`, `frontend/src/expense/hooks/useExpenseCreateForm.ts`, `frontend/src/expense/hooks/useExpenseEditForm.ts`, `frontend/src/expense/libs/expenseFormDraft.ts`

- [ ] Task: フィルタ・テスト更新
  - Acceptance: `expense.vibe?.social` 等でフィルタ動作。既存テスト全緑
  - Verify: `make test-frontend`
  - Files: `frontend/src/expense/libs/expenseFilter.ts`, `frontend/src/expense/libs/expenseFilter.test.ts`, `frontend/src/expense/components/*Vibe*.tsx`

### Phase 7: 手動確認

- [ ] Task: E2E 手動確認
  - Acceptance: 記帳→詳細→export→import の vibe 一貫性。定期 record で vibe 付与
  - Verify: ブラウザ操作 + export JSON 目視
  - Files: —
