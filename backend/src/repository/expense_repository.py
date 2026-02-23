from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense import Expense


def get_all_expenses(db: Session, user_uuid: str, *, include_deleted: bool = False) -> list[Expense]:
    """すべての支出を取得する(削除されていないもののみ)"""
    query = db.query(Expense).filter(Expense.user_uuid == user_uuid)
    if not include_deleted:
        query = query.filter(Expense.deleted_at.is_(None))
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
