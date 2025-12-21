from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from src.model.transaction import Transaction
from src.model.category import Category


def get_all_transactions(db: Session, include_deleted: bool = False) -> List[Transaction]:
    """すべてのトランザクションを取得する（削除されていないもののみ）"""
    query = db.query(Transaction)
    if not include_deleted:
        query = query.filter(Transaction.deleted_at.is_(None))
    return query.all()


def get_transaction_by_uuid(db: Session, uuid: str) -> Optional[Transaction]:
    """UUIDでトランザクションを取得する"""
    return db.query(Transaction).filter(
        Transaction.uuid == uuid,
        Transaction.deleted_at.is_(None)
    ).first()


def create_transaction(
    db: Session,
    name: str,
    amount: float,
    category_uuids: List[str] = None
) -> Transaction:
    """新しいトランザクションを作成する"""
    transaction = Transaction(name=name, amount=amount)
    
    if category_uuids:
        categories = db.query(Category).filter(Category.uuid.in_(category_uuids)).all()
        transaction.categories = categories
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def soft_delete_transaction(db: Session, uuid: str) -> Optional[Transaction]:
    """トランザクションを論理削除する"""
    transaction = db.query(Transaction).filter(
        Transaction.uuid == uuid,
        Transaction.deleted_at.is_(None)
    ).first()
    
    if transaction:
        transaction.deleted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(transaction)
    
    return transaction

