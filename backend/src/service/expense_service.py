from __future__ import annotations

from typing import TYPE_CHECKING, Any

from src.repository import expense_repository

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.model.expense import Expense


def update_expense(
    db: Session,
    expense: Expense,
    user_uuid: str,
    update_data: dict[str, Any],
    category_uuids: list[str] | None,
) -> Expense:
    """フィールド更新とカテゴリ再リンクを1トランザクションで実行。

    category_uuids=None ならカテゴリ未変更、[] ならクリア。
    """
    for key, value in update_data.items():
        setattr(expense, key, value)

    if category_uuids is not None:
        expense_repository.update_expense_categories(db, expense, user_uuid, category_uuids)

    db.commit()
    db.refresh(expense)
    return expense
