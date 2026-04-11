from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense_category_association import ExpenseCategoryAssociation


def get_all_categories(db: Session, user_uuid: str) -> list[Category]:
    """Get all categories."""
    return db.query(Category).filter(Category.user_uuid == user_uuid).all()


def get_category_by_uuid(db: Session, uuid: str, user_uuid: str) -> Category | None:
    """Get a category by UUID."""
    return db.query(Category).filter(Category.uuid == uuid, Category.user_uuid == user_uuid).first()


def create_category(db: Session, user_uuid: str, name: str) -> Category:
    """Create a new category."""
    category = Category(user_uuid=user_uuid, name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_all_categories(db: Session) -> None:
    """Delete all categories (including association table records)."""
    db.query(ExpenseCategoryAssociation).delete()
    db.query(Category).delete()


def bulk_create_categories(db: Session, user_uuid: str, names: list[str]) -> list[Category]:
    """Bulk-create categories."""
    categories = [Category(user_uuid=user_uuid, name=name) for name in names]
    db.add_all(categories)
    db.commit()
    for category in categories:
        db.refresh(category)
    return categories


def update_category(db: Session, category: Category, name: str) -> Category:
    """Update a category name."""
    category.name = name  # type: ignore[assignment]
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    """Hard-delete a category."""
    db.delete(category)
    db.commit()
