from __future__ import annotations

from typing import TYPE_CHECKING

from src.model.category import Category
from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.repository.category_repository import (
    delete_all_for_user as delete_all_categories_for_user,
)
from src.repository.category_repository import (
    get_all_categories,
)
from src.repository.expense_repository import (
    delete_all_for_user as delete_all_expenses_for_user,
)
from src.repository.expense_repository import (
    get_all_expenses,
)

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.model.user import User
    from src.schema.user import UserImportRequest


def export_user_data(
    db: Session, user: User,
) -> tuple[list[Category], list[Expense]]:
    """ユーザーの全データをexport用に取得。"""
    user_uuid = str(user.uuid)
    categories = get_all_categories(db, user_uuid)
    expenses = get_all_expenses(db, user_uuid, include_deleted=True)
    return categories, expenses


def import_user_data(
    db: Session, user: User, body: UserImportRequest,
) -> tuple[int, int]:
    """既存データを全削除し、bodyの内容で再インポート。

    返り値: (categories_count, expenses_count)
    """
    user_uuid = str(user.uuid)

    # 既存データを一掃 (FK CASCADEでassociationも消える)
    delete_all_expenses_for_user(db, user_uuid)
    delete_all_categories_for_user(db, user_uuid)

    # カテゴリを再構築 (旧UUID -> 新UUIDマップ)
    category_uuid_map: dict[str, str] = {}
    for cat in body.categories:
        new_category = Category(user_uuid=user_uuid, name=cat.name)
        db.add(new_category)
        db.flush()
        category_uuid_map[cat.uuid] = str(new_category.uuid)

    # Expense + association 再構築
    for exp in body.expenses:
        expense = Expense(
            user_uuid=user_uuid,
            name=exp.name,
            amount=exp.amount,
            expensed_at=exp.expensed_at,
            created_at=exp.created_at,
            updated_at=exp.updated_at,
            deleted_at=exp.deleted_at,
        )
        db.add(expense)
        db.flush()
        for cat in exp.categories:
            new_uuid = category_uuid_map.get(cat.uuid)
            if new_uuid:
                db.add(
                    ExpenseCategoryAssociation(
                        expense_uuid=expense.uuid, category_uuid=new_uuid,
                    ),
                )

    db.commit()
    return len(body.categories), len(body.expenses)
