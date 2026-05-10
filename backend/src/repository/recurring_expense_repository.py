from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from src.model.expense import Expense
from src.model.recurring_expense import RecurringExpense


def get_all_active(db: Session, user_uuid: str) -> list[RecurringExpense]:
    """ユーザーの未削除定期支払一覧を取得 (categoryをeager load)。"""
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
    """全ユーザーの未削除定期支払を取得 (cron用)。"""
    return (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.deleted_at.is_(None))
        .all()
    )


def get_by_uuid(db: Session, uuid: str, user_uuid: str) -> RecurringExpense | None:
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


def count_recorded(db: Session, recurring_uuid: str) -> int:
    """定期支払に紐づくExpense件数を取得 (soft-delete除外)。"""
    result = (
        db.query(func.count(Expense.uuid))
        .filter(
            Expense.recurring_expense_uuid == recurring_uuid,
            Expense.deleted_at.is_(None),
        )
        .scalar()
    )
    return int(result or 0)


def create(db: Session, user_uuid: str, fields: dict[str, Any]) -> RecurringExpense:
    """新規作成。category eager loadした状態で返す。"""
    recurring = RecurringExpense(user_uuid=user_uuid, **fields)
    db.add(recurring)
    db.commit()
    db.refresh(recurring)
    return (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.uuid == recurring.uuid)
        .one()
    )


def update(db: Session, recurring: RecurringExpense, fields: dict[str, Any]) -> RecurringExpense:
    """指定フィールドを更新。"""
    for key, value in fields.items():
        setattr(recurring, key, value)
    db.commit()
    db.refresh(recurring)
    return recurring


def soft_delete(db: Session, recurring: RecurringExpense) -> None:
    """定期支払を論理削除。"""
    recurring.deleted_at = datetime.now(UTC)  # type: ignore[assignment]
    db.commit()


def get_all_including_deleted(db: Session, user_uuid: str) -> list[RecurringExpense]:
    """export用: soft-delete含む全件を取得。"""
    return db.query(RecurringExpense).filter(RecurringExpense.user_uuid == user_uuid).all()


def delete_all_for_user(db: Session, user_uuid: str) -> None:
    """import用: ユーザーの定期支払を物理削除。"""
    db.query(RecurringExpense).filter(RecurringExpense.user_uuid == user_uuid).delete(
        synchronize_session=False,
    )
    db.flush()
