from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from src.model.expense import Expense
from src.model.recurring_expense import RecurringExpense


def get_all_active(db: Session, user_uuid: str) -> list[RecurringExpense]:
    """List all active recurring expenses for the user."""
    return (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(
            RecurringExpense.user_uuid == user_uuid,
            RecurringExpense.deleted_at.is_(None),
        )
        .all()
    )


def get_all_active_for_cron(db: Session) -> list[RecurringExpense]:
    """List all active recurring expenses across users (for cron)."""
    return (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.deleted_at.is_(None))
        .all()
    )


def get_by_uuid(db: Session, uuid: str, user_uuid: str) -> RecurringExpense | None:
    """Fetch a single recurring expense for the user."""
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


def count_recorded(db: Session, recurring_uuid: str) -> int:
    """Count expenses linked to this recurring expense (excluding soft-deleted)."""
    result = (
        db.query(func.count(Expense.uuid))
        .filter(
            Expense.recurring_expense_uuid == recurring_uuid,
            Expense.deleted_at.is_(None),
        )
        .scalar()
    )
    return int(result or 0)


def soft_delete(db: Session, recurring: RecurringExpense) -> None:
    """Soft-delete a recurring expense."""
    recurring.deleted_at = datetime.now(UTC)  # type: ignore[assignment]
    db.commit()
