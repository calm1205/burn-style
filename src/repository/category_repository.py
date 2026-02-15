
from sqlalchemy.orm import Session

from src.model.category import Category


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

