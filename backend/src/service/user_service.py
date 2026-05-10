from __future__ import annotations

from typing import TYPE_CHECKING

from src.model.category import Category
from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.recurring_expense import RecurringExpense
from src.repository import recurring_expense_repository
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
) -> tuple[list[Category], list[Expense], list[RecurringExpense]]:
    """ユーザーの全データをexport用に取得。"""
    user_uuid = str(user.uuid)
    categories = get_all_categories(db, user_uuid)
    expenses = get_all_expenses(db, user_uuid, include_deleted=True)
    recurrings = recurring_expense_repository.get_all_including_deleted(db, user_uuid)
    return categories, expenses, recurrings


def import_user_data(
    db: Session, user: User, body: UserImportRequest,
) -> tuple[int, int, int]:
    """既存データを全削除し、bodyの内容で再インポート。

    返り値: (categories_count, expenses_count, recurring_expenses_count)
    """
    user_uuid = str(user.uuid)

    # 既存データを一掃 (FK CASCADEでassociationも消える)
    delete_all_expenses_for_user(db, user_uuid)
    recurring_expense_repository.delete_all_for_user(db, user_uuid)
    delete_all_categories_for_user(db, user_uuid)

    # カテゴリを再構築 (旧UUID -> 新UUIDマップ)
    category_uuid_map: dict[str, str] = {}
    for cat in body.categories:
        new_category = Category(
            user_uuid=user_uuid,
            name=cat.name,
            symbol=cat.symbol,
            position=cat.position,
        )
        db.add(new_category)
        db.flush()
        category_uuid_map[cat.uuid] = str(new_category.uuid)

    # 定期支払を再構築 (旧UUID -> 新UUIDマップ)
    recurring_uuid_map: dict[str, str] = {}
    for rec in body.recurring_expenses:
        new_cat_uuid = category_uuid_map.get(rec.category_uuid)
        if not new_cat_uuid:
            continue
        new_recurring = RecurringExpense(
            user_uuid=user_uuid,
            name=rec.name,
            amount=rec.amount,
            category_uuid=new_cat_uuid,
            interval_unit=rec.interval_unit,
            interval_count=rec.interval_count,
            start_date=rec.start_date,
            end_date=rec.end_date,
            created_at=rec.created_at,
            updated_at=rec.updated_at,
            deleted_at=rec.deleted_at,
        )
        db.add(new_recurring)
        db.flush()
        recurring_uuid_map[rec.uuid] = str(new_recurring.uuid)

    # Expense + association 再構築
    for exp in body.expenses:
        new_recurring_uuid = (
            recurring_uuid_map.get(exp.recurring_expense_uuid)
            if exp.recurring_expense_uuid
            else None
        )
        expense = Expense(
            user_uuid=user_uuid,
            name=exp.name,
            amount=exp.amount,
            expensed_at=exp.expensed_at,
            created_at=exp.created_at,
            updated_at=exp.updated_at,
            deleted_at=exp.deleted_at,
            vibe_social=exp.vibe_social,
            vibe_planning=exp.vibe_planning,
            vibe_necessity=exp.vibe_necessity,
            recurring_expense_uuid=new_recurring_uuid,
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
    return len(body.categories), len(body.expenses), len(recurring_uuid_map)
