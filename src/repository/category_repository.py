
from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense_category_association import ExpenseCategoryAssociation


def get_all_categories(db: Session) -> list[Category]:
    """すべてのカテゴリを取得する"""
    return db.query(Category).all()


def get_category_by_uuid(db: Session, uuid: str) -> Category | None:
    """UUIDでカテゴリを取得する"""
    return db.query(Category).filter(Category.uuid == uuid).first()


def create_category(db: Session, name: str) -> Category:
    """新しいカテゴリを作成する"""
    category = Category(name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_all_categories(db: Session) -> None:
    """すべてのカテゴリを削除する（関連する中間テーブルも削除）"""
    db.query(ExpenseCategoryAssociation).delete()
    db.query(Category).delete()


def bulk_create_categories(db: Session, names: list[str]) -> list[Category]:
    """カテゴリを一括作成する"""
    categories = [Category(name=name) for name in names]
    db.add_all(categories)
    db.commit()
    for category in categories:
        db.refresh(category)
    return categories

