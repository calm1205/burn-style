from __future__ import annotations

from sqlalchemy.orm import Session, joinedload

from src.domain.recurring_expense import RecurringExpense


def get_all_recurring_expenses(
    db: Session,
    *,
    include_deleted: bool = False,
) -> list[RecurringExpense]:
    """全ユーザーの定期支払一覧を取得 (デフォルトは未削除のみ)。"""
    query = (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
    )
    if not include_deleted:
        query = query.filter(RecurringExpense.deleted_at.is_(None))
    return query.all()
