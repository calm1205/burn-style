from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, TypedDict, cast

from src.domain.vibe import VibeFields, write_vibe_fields
from src.infrastructure import expense_repository

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.domain.expense import Expense


class ExpensePatch(TypedDict, total=False):
    name: str
    amount: int
    expensed_at: datetime
    vibe: VibeFields | None


def update_expense(  # noqa: PLR0913
    db: Session,
    expense: Expense,
    user_uuid: str,
    expense_patch: ExpensePatch,
    category_uuids: list[str] | None,
    *,
    vibe_set: bool = False,
) -> Expense:
    """フィールド更新とカテゴリ再リンクを1トランザクションで実行。

    category_uuids=None ならカテゴリ未変更、[] ならクリア。
    """
    patch = dict(expense_patch)
    vibe_value = cast(VibeFields | None, patch.pop("vibe", None)) if vibe_set else None

    for key, value in patch.items():
        setattr(expense, key, value)

    if vibe_set and not expense.recurring_expense_uuid:
        write_vibe_fields(expense, vibe_value)
    elif expense.recurring_expense_uuid:
        write_vibe_fields(expense, None)

    if category_uuids is not None:
        expense_repository.update_expense_categories(db, expense, user_uuid, category_uuids)

    db.commit()
    db.refresh(expense)
    return expense
