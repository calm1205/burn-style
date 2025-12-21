from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from src.model.expense import Expense
from src.model.category import Category


def get_all_expenses(db: Session, include_deleted: bool = False) -> List[Expense]:
    """すべての支出を取得する（削除されていないもののみ）"""
    query = db.query(Expense)
    if not include_deleted:
        query = query.filter(Expense.deleted_at.is_(None))
    return query.all()


def get_expenses_by_user_uuid(db: Session, user_uuid: str, include_deleted: bool = False) -> List[Expense]:
    """ユーザーUUIDで支出を取得する（削除されていないもののみ）"""
    query = db.query(Expense).filter(Expense.user_uuid == user_uuid)
    if not include_deleted:
        query = query.filter(Expense.deleted_at.is_(None))
    return query.all()


def get_expense_by_uuid(db: Session, uuid: str) -> Optional[Expense]:
    """UUIDで支出を取得する"""
    return db.query(Expense).filter(
        Expense.uuid == uuid,
        Expense.deleted_at.is_(None)
    ).first()


def create_expense(
    db: Session,
    name: str,
    amount: float,
    category_uuids: List[str] = None
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


def soft_delete_expense(db: Session, uuid: str) -> Optional[Expense]:
    """支出を論理削除する"""
    expense = db.query(Expense).filter(
        Expense.uuid == uuid,
        Expense.deleted_at.is_(None)
    ).first()
    
    if expense:
        expense.deleted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(expense)
    
    return expense

