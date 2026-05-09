from __future__ import annotations

from typing import TYPE_CHECKING

from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.repository import expense_template_repository

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.model.expense_template import ExpenseTemplate


def bulk_record(
    db: Session, template_uuids: list[str], user_uuid: str,
) -> list[ExpenseTemplate]:
    """指定テンプレートからExpenseを一括生成。テンプレート一覧を返す。

    呼び元で len() を取れば作成件数になる。
    """
    templates = expense_template_repository.get_active_by_uuids(db, template_uuids, user_uuid)
    if not templates:
        return []

    for t in templates:
        expense = Expense(user_uuid=user_uuid, name=t.name, amount=t.amount)
        db.add(expense)
        db.flush()
        db.add(
            ExpenseCategoryAssociation(
                expense_uuid=expense.uuid, category_uuid=t.category_uuid,
            ),
        )
    db.commit()
    return templates
