from __future__ import annotations

from datetime import UTC, date, datetime
from typing import TypedDict

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from src.domain.expense import Expense
from src.domain.recurring_expense import IntervalUnit, RecurringExpense


class RecurringExpenseCreateFields(TypedDict):
    name: str
    amount: int
    category_uuid: str
    interval_unit: IntervalUnit
    interval_count: int
    start_date: date
    end_date: date | None


class RecurringExpensePatch(TypedDict, total=False):
    name: str
    amount: int
    category_uuid: str
    interval_unit: IntervalUnit
    interval_count: int
    start_date: date
    end_date: date | None


def get_all_recurring_expenses(
    db: Session,
    user_uuid: str,
    *,
    include_deleted: bool = False,
) -> list[RecurringExpense]:
    """ユーザーの定期支払一覧を取得 (デフォルトは未削除のみ、categoryをeager load)。"""
    query = (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.user_uuid == user_uuid)
    )
    if not include_deleted:
        query = query.filter(RecurringExpense.deleted_at.is_(None))
    return query.all()


def get_recurring_expense_by_uuid(db: Session, uuid: str, user_uuid: str) -> RecurringExpense | None:
    """UUIDで定期支払を単体取得 (未削除のみ)。"""
    return (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(
            RecurringExpense.uuid == uuid,
            RecurringExpense.user_uuid == user_uuid,
            RecurringExpense.deleted_at.is_(None),
        )
        .first()
    )


def count_linked_expenses(db: Session, recurring_uuid: str) -> int:
    """定期支払に紐づくExpense件数を取得 (soft-delete除外)。"""
    linked_count = (
        db.query(func.count(Expense.uuid))
        .filter(
            Expense.recurring_expense_uuid == recurring_uuid,
            Expense.deleted_at.is_(None),
        )
        .scalar()
    )
    return int(linked_count or 0)


def create_recurring_expense(
    db: Session,
    user_uuid: str,
    create_fields: RecurringExpenseCreateFields,
) -> RecurringExpense:
    """新規作成。category eager loadした状態で返す。"""
    recurring = RecurringExpense(user_uuid=user_uuid, **create_fields)
    db.add(recurring)
    db.commit()
    db.refresh(recurring)
    return (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.uuid == recurring.uuid)
        .one()
    )


def update_recurring_expense(
    db: Session,
    recurring: RecurringExpense,
    recurring_expense_patch: RecurringExpensePatch,
) -> RecurringExpense:
    """指定フィールドを更新。"""
    for key, value in recurring_expense_patch.items():
        setattr(recurring, key, value)
    db.commit()
    db.refresh(recurring)
    return recurring


def soft_delete_recurring_expense(db: Session, recurring: RecurringExpense) -> None:
    """定期支払を論理削除。"""
    recurring.deleted_at = datetime.now(UTC)  # type: ignore[assignment]
    db.commit()


def delete_all_by_user_uuid(db: Session, user_uuid: str) -> None:
    """import用: ユーザーの定期支払を物理削除。"""
    db.query(RecurringExpense).filter(RecurringExpense.user_uuid == user_uuid).delete(
        synchronize_session=False,
    )
    db.flush()
