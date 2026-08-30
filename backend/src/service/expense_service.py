from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, TypedDict

from src.domain.expense import VibeNecessity, VibePlanning, VibeSocial
from src.infrastructure import expense_repository

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.domain.expense import Expense


class ExpensePatch(TypedDict, total=False):
    name: str
    amount: int
    expensed_at: datetime
    vibe_social: VibeSocial | None
    vibe_planning: VibePlanning | None
    vibe_necessity: VibeNecessity | None


def update_expense(
    db: Session,
    expense: Expense,
    user_uuid: str,
    expense_patch: ExpensePatch,
    category_uuids: list[str] | None,
) -> Expense:
    """フィールド更新とカテゴリ再リンクを1トランザクションで実行。

    category_uuids=None ならカテゴリ未変更、[] ならクリア。
    """
    for key, value in expense_patch.items():
        setattr(expense, key, value)

    if category_uuids is not None:
        expense_repository.update_expense_categories(db, expense, user_uuid, category_uuids)

    db.commit()
    db.refresh(expense)
    return expense
