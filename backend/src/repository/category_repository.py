from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.expense_template import ExpenseTemplate


def get_all_categories(db: Session, user_uuid: str) -> list[Category]:
    """カテゴリ一覧を取得。"""
    return db.query(Category).filter(Category.user_uuid == user_uuid).all()


def get_category_by_uuid(db: Session, uuid: str, user_uuid: str) -> Category | None:
    """UUIDでカテゴリを取得。"""
    return db.query(Category).filter(Category.uuid == uuid, Category.user_uuid == user_uuid).first()


def create_category(db: Session, user_uuid: str, name: str) -> Category:
    """カテゴリを新規作成。"""
    category = Category(user_uuid=user_uuid, name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_all_categories(db: Session) -> None:
    """全カテゴリを削除 (association表のレコードも含む)。"""
    db.query(ExpenseCategoryAssociation).delete()
    db.query(Category).delete()


def delete_all_for_user(db: Session, user_uuid: str) -> None:
    """ユーザーの全Categoryを物理削除 (FK CASCADEでassociationも消える)。"""
    db.query(Category).filter(Category.user_uuid == user_uuid).delete(synchronize_session=False)


def bulk_create_categories(db: Session, user_uuid: str, names: list[str]) -> list[Category]:
    """カテゴリを一括作成。"""
    categories = [Category(user_uuid=user_uuid, name=name) for name in names]
    db.add_all(categories)
    db.commit()
    for category in categories:
        db.refresh(category)
    return categories


def update_category(db: Session, category: Category, name: str) -> Category:
    """カテゴリ名を更新。"""
    category.name = name  # type: ignore[assignment]
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    """カテゴリを物理削除。"""
    db.delete(category)
    db.commit()


def merge_categories(db: Session, source: Category, target: Category) -> Category:
    """sourceカテゴリをtargetに統合。expense関連付けとtemplateを付け替えてsourceを削除。重複は排除。"""
    target_expense_uuids = {
        row[0]
        for row in db.query(ExpenseCategoryAssociation.expense_uuid)
        .filter(ExpenseCategoryAssociation.category_uuid == target.uuid)
        .all()
    }
    source_expense_uuids = {
        row[0]
        for row in db.query(ExpenseCategoryAssociation.expense_uuid)
        .filter(ExpenseCategoryAssociation.category_uuid == source.uuid)
        .all()
    }

    db.query(ExpenseCategoryAssociation).filter(
        ExpenseCategoryAssociation.category_uuid == source.uuid,
    ).delete()

    for expense_uuid in source_expense_uuids - target_expense_uuids:
        db.add(
            ExpenseCategoryAssociation(expense_uuid=expense_uuid, category_uuid=target.uuid),
        )

    db.query(ExpenseTemplate).filter(ExpenseTemplate.category_uuid == source.uuid).update(
        {"category_uuid": target.uuid},
    )

    db.delete(source)
    db.commit()
    db.refresh(target)
    return target
