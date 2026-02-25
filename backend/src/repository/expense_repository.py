from __future__ import annotations

import calendar
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense import Expense


def get_all_expenses(
    db: Session,
    user_uuid: str,
    *,
    year: int | None = None,
    month: int | None = None,
    include_deleted: bool = False,
) -> list[Expense]:
    """すべての支出を取得する(削除されていないもののみ)"""
    query = db.query(Expense).filter(Expense.user_uuid == user_uuid)
    if not include_deleted:
        query = query.filter(Expense.deleted_at.is_(None))
    if year is not None and month is not None:
        start = datetime(year, month, 1, tzinfo=UTC)
        last_day = calendar.monthrange(year, month)[1]
        end = datetime(year, month, last_day, 23, 59, 59, tzinfo=UTC)
        query = query.filter(Expense.created_at >= start, Expense.created_at <= end)
    return query.all()


def get_expense_by_uuid(db: Session, uuid: str, user_uuid: str) -> Expense | None:
    """UUIDで支出を取得する"""
    return db.query(Expense).filter(
        Expense.uuid == uuid,
        Expense.user_uuid == user_uuid,
        Expense.deleted_at.is_(None),
    ).first()


def create_expense(
    db: Session,
    user_uuid: str,
    name: str,
    amount: float,
    category_uuids: list[str] | None = None,
) -> Expense:
    """新しい支出を作成する"""
    expense = Expense(user_uuid=user_uuid, name=name, amount=amount)

    if category_uuids:
        categories = db.query(Category).filter(
            Category.uuid.in_(category_uuids),
            Category.user_uuid == user_uuid,
        ).all()
        expense.categories = categories

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def update_expense_categories(db: Session, expense: Expense, user_uuid: str, category_uuids: list[str]) -> None:
    """支出のカテゴリを更新する"""
    categories = db.query(Category).filter(
        Category.uuid.in_(category_uuids),
        Category.user_uuid == user_uuid,
    ).all()
    expense.categories = categories


def soft_delete_expense(db: Session, expense: Expense) -> None:
    """支出を論理削除する"""
    expense.deleted_at = datetime.now(UTC)  # type: ignore[assignment]
    db.commit()
