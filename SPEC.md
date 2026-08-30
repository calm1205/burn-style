# Spec: recurring expense 層の命名リファクタ

## 前提

- 対象は `recurring_expense_repository` と `recurring_expense_service` の識別子リネームのみ
- 挙動・API レスポンス・DB スキーマは変更しない
- 既存 repository はモジュール関数方式（クラスなし）がプロジェクト慣例
- `active` は soft-delete 除外（`deleted_at IS NULL`）を指す
- 有効期間（`start_date` / `end_date` 内）は `active` とは別概念
- `expense_repository.get_all_expenses(..., include_deleted=)` と語彙を揃える
- `category_repository` / `expense_repository` の `delete_all_for_user` も同 Issue で `delete_all_by_user_uuid` に揃える

## 目的

- `_for_cron` / `_for_user` サフィックスが呼び出し文脈を関数名に漏らし、`for~` 増殖の温床になっている問題を解消する
- `get_all_active` が soft-delete 除外なのか有効期間内なのか判別不能な問題を解消する
- 対象者: 本リポジトリを保守する開発者
- 成功: 名前だけで責務とフィルタ条件が読み取れ、既存テストが全緑のまま

## リネーム対応表

| 現状 | 提案 | 備考 |
|------|------|------|
| `get_all_active(db, user_uuid)` | `get_all_recurring_expenses(db, user_uuid, *, include_deleted=False)` | `expense_repository` と同パターン |
| `get_all_active_for_cron(db)` | cron 専用モジュールへ移動（下記） | 文脈をモジュール名で表現 |
| `get_all_including_deleted(db, user_uuid)` | 上記 `include_deleted=True` に統合 | export 呼び出し元 1 箇所 |
| `delete_all_for_user(db, user_uuid)` | `delete_all_by_user_uuid(db, user_uuid)` | import 用の物理削除 |
| `record_all_due_for_cron(db)` | cron 専用モジュールへ移動（下記） | 文脈をモジュール名で表現 |

### cron 専用モジュール（クラス分離の代替案）

プロジェクト慣例に合わせ、クラスではなくモジュール分離とする。

```
backend/src/infrastructure/cron_recurring_expense_repository.py
  get_all_recurring_expenses(db, *, include_deleted=False)  # user_uuid なし = 全ユーザー

backend/src/service/cron_recurring_expense_service.py
  record_due_recurring_occurrences(db) -> tuple[int, int]
```

- `CronRecurringExpenseRepository` クラス案は慣例不一致のため不採用
- cron 文脈は `cron_*` モジュール名で表現し、メソッド名から `_for_cron` を排除

## コードスタイル

`expense_repository` に揃えた一覧取得:

```python
def get_all_recurring_expenses(
    db: Session,
    user_uuid: str,
    *,
    include_deleted: bool = False,
) -> list[RecurringExpense]:
    """ユーザーの定期支払一覧を取得 (デフォルトは未削除のみ)。"""
    query = (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.user_uuid == user_uuid)
    )
    if not include_deleted:
        query = query.filter(RecurringExpense.deleted_at.is_(None))
    return query.all()
```

cron 専用 repository（全ユーザー横断）:

```python
# cron_recurring_expense_repository.py
def get_all_recurring_expenses(
    db: Session,
    *,
    include_deleted: bool = False,
) -> list[RecurringExpense]:
    """全ユーザーの定期支払一覧を取得 (デフォルトは未削除のみ)。"""
    ...
```

命名規約:

- 一覧取得: `get_all_{entity_plural}` + `include_deleted` キーワード引数
- ユーザー条件削除: `delete_all_by_user_uuid`（`for_user` 不使用）
- cron 処理: `cron_*` モジュール + 動詞句メソッド（`_for_cron` 不使用）
- docstring で soft-delete / 物理削除 / export 用途を明示

## テスト戦略

- 既存 `tests/presentation/api/test_recurring_expenses.py` の内容・期待値は変更しない
- import path のみ新モジュール名に追従
- repository 層の直接テストは現状なし。API テストで間接検証
- 完了条件: `make lint` ゼロエラー、`make test-backend` 全件成功

## 境界

- **常に行う**:
  - リネームのみ（関数本体のロジック・戻り値・副作用は不変）
  - `make lint` / `make test-backend` 実行
  - 旧関数名への参照が残っていないことを grep で確認
- **事前確認**:
  - cron モジュール分離方針（本スペック案）のユーザー承認
  - `get_all_including_deleted` を `include_deleted=True` に統合する方針の承認
- **絶対にしない**:
  - API エンドポイント path / レスポンス形式の変更
  - DB スキーマ・マイグレーションの変更
  - 有効期間フィルタ（`start_date` / `end_date`）の追加

## 成功基準

- [ ] `get_all_active` / `get_all_active_for_cron` / `get_all_including_deleted` が存在しない
- [ ] `get_all_recurring_expenses` が user 用 repository に存在し、`include_deleted` で soft-delete 除外を明示
- [ ] cron 用 `get_all_recurring_expenses` が `cron_recurring_expense_repository` に存在
- [ ] `delete_all_for_user` が `delete_all_by_user_uuid` にリネーム済み
- [ ] `record_all_due_for_cron` が `cron_recurring_expense_service.record_due_recurring_occurrences` に移行済み
- [ ] `_for_cron` / `_for_user` サフィックスが repository / service 層に残っていない
- [ ] `category_repository` / `expense_repository` の `delete_all_by_user_uuid` リネーム済み
- [ ] `make lint` ゼロエラー
- [ ] `make test-backend` 全件成功

## 未解決の問い

- なし（cron はモジュール分離、`include_deleted` 統合、横展開は同 Issue で確定）
