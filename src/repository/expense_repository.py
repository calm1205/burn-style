from datetime import UTC, datetime

from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense import Expense


def get_all_expenses(db: Session, *, include_deleted: bool = False) -> list[Expense]:
    """すべての支出を取得する(削除されていないもののみ)"""
    query = db.query(Expense)
    if not include_deleted:
        query = query.filter(Expense.deleted_at.is_(None))
    return query.all()


def get_expense_by_uuid(db: Session, uuid: str) -> Expense | None:
    """UUIDで支出を取得する"""
    return db.query(Expense).filter(
        Expense.uuid == uuid,
        Expense.deleted_at.is_(None),
    ).first()


def create_expense(
    db: Session,
    name: str,
    amount: float,
    category_uuids: list[str] | None = None,
) -> Expense:
    """新しい支出を作成する"""
    expense = Expense(name=name, amount=amount)

    if category_uuids:
        categories = db.query(Category).filter(Category.uuid.in_(category_uuids)).all()
        expense.categories = categories

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def soft_delete_expense(db: Session, uuid: str) -> Expense | None:
    """支出を論理削除する"""
    expense = db.query(Expense).filter(
        Expense.uuid == uuid,
        Expense.deleted_at.is_(None),
    ).first()

    if expense:
        expense.deleted_at = datetime.now(UTC)
        db.commit()
        db.refresh(expense)

    return expense

