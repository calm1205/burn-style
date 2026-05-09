from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.expense_template import ExpenseTemplate


def get_all_categories(db: Session, user_uuid: str) -> list[Category]:
    """カテゴリ一覧を取得 (position昇順、tiebreakerにuuid)。"""
    return (
        db.query(Category)
        .filter(Category.user_uuid == user_uuid)
        .order_by(Category.position.asc(), Category.uuid.asc())
        .all()
    )


def get_category_by_uuid(db: Session, uuid: str, user_uuid: str) -> Category | None:
    """UUIDでカテゴリを取得。"""
    return db.query(Category).filter(Category.uuid == uuid, Category.user_uuid == user_uuid).first()


def create_category(
    db: Session, user_uuid: str, name: str, symbol: str | None = None,
) -> Category:
    """カテゴリを新規作成 (positionは末尾)。"""
    next_position = (
        db.query(func.coalesce(func.max(Category.position), -1))
        .filter(Category.user_uuid == user_uuid)
        .scalar()
        or -1
    )
    category = Category(
        user_uuid=user_uuid,
        name=name,
        symbol=symbol,
        position=int(next_position) + 1,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def reorder_categories(db: Session, user_uuid: str, ordered_uuids: list[str]) -> list[Category]:
    """渡されたUUID列順にpositionを 0,1,2,... で割り当てて保存。

    user_uuidに属する全カテゴリが含まれる必要があり、欠落・他ユーザー所有 UUID 混入時は ValueError。
    """
    existing = (
        db.query(Category)
        .filter(Category.user_uuid == user_uuid)
        .all()
    )
    existing_uuids = {str(c.uuid) for c in existing}
    given_uuids = set(ordered_uuids)
    if existing_uuids != given_uuids or len(ordered_uuids) != len(given_uuids):
        raise ValueError("ordered_uuids must be a permutation of the user's category uuids")

    by_uuid = {str(c.uuid): c for c in existing}
    for index, uuid in enumerate(ordered_uuids):
        by_uuid[uuid].position = index  # type: ignore[assignment]
    db.commit()
    return get_all_categories(db, user_uuid)


def compact_positions(db: Session, user_uuid: str) -> None:
    """user_uuidに属するカテゴリのpositionを 0,1,2,... に詰め直す (merge後の隙間を埋める)。"""
    categories = (
        db.query(Category)
        .filter(Category.user_uuid == user_uuid)
        .order_by(Category.position.asc(), Category.uuid.asc())
        .all()
    )
    for index, c in enumerate(categories):
        c.position = index  # type: ignore[assignment]
    db.commit()


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


def update_category(
    db: Session, category: Category, fields: dict[str, str | None],
) -> Category:
    """カテゴリの指定フィールドを更新 (name / symbol)。"""
    for key, value in fields.items():
        setattr(category, key, value)
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

    user_uuid = str(source.user_uuid)
    db.delete(source)
    db.commit()
    # sourceの抜けた分をpositionに反映
    compact_positions(db, user_uuid)
    db.refresh(target)
    return target
