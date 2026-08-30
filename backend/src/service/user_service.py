from __future__ import annotations

from typing import TYPE_CHECKING

from src.domain.category import Category
from src.domain.expense import Expense
from src.domain.expense_category_association import ExpenseCategoryAssociation
from src.domain.recurring_expense import RecurringExpense
from src.infrastructure import recurring_expense_repository
from src.infrastructure.category_repository import (
    delete_all_for_user as delete_all_categories_for_user,
)
from src.infrastructure.category_repository import (
    get_all_categories,
)
from src.infrastructure.expense_repository import (
    delete_all_for_user as delete_all_expenses_for_user,
)
from src.infrastructure.expense_repository import (
    get_all_expenses,
)

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from src.domain.user import User
    from src.presentation.schema.user import UserImportRequest


def export_user_snapshot(
    db: Session, user: User,
) -> tuple[list[Category], list[Expense], list[RecurringExpense]]:
    """ユーザーの全データをexport用に取得。"""
    user_uuid = str(user.uuid)
    categories = get_all_categories(db, user_uuid)
    expenses = get_all_expenses(db, user_uuid, include_deleted=True)
    recurring_expenses = recurring_expense_repository.get_all_including_deleted(db, user_uuid)
    return categories, expenses, recurring_expenses


def import_user_snapshot(
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
    for category in body.categories:
        new_category = Category(
            user_uuid=user_uuid,
            name=category.name,
            symbol=category.symbol,
            position=category.position,
        )
        db.add(new_category)
        db.flush()
        category_uuid_map[category.uuid] = str(new_category.uuid)

    # 定期支払を再構築 (旧UUID -> 新UUIDマップ)
    recurring_uuid_map: dict[str, str] = {}
    for recurring_expense in body.recurring_expenses:
        new_cat_uuid = category_uuid_map.get(recurring_expense.category_uuid)
        if not new_cat_uuid:
            continue
        new_recurring = RecurringExpense(
            user_uuid=user_uuid,
            name=recurring_expense.name,
            amount=recurring_expense.amount,
            category_uuid=new_cat_uuid,
            interval_unit=recurring_expense.interval_unit,
            interval_count=recurring_expense.interval_count,
            start_date=recurring_expense.start_date,
            end_date=recurring_expense.end_date,
            created_at=recurring_expense.created_at,
            updated_at=recurring_expense.updated_at,
            deleted_at=recurring_expense.deleted_at,
        )
        db.add(new_recurring)
        db.flush()
        recurring_uuid_map[recurring_expense.uuid] = str(new_recurring.uuid)

    # Expense + association 再構築
    for expense in body.expenses:
        new_recurring_uuid = (
            recurring_uuid_map.get(expense.recurring_expense_uuid)
            if expense.recurring_expense_uuid
            else None
        )
        new_expense = Expense(
            user_uuid=user_uuid,
            name=expense.name,
            amount=expense.amount,
            expensed_at=expense.expensed_at,
            created_at=expense.created_at,
            updated_at=expense.updated_at,
            deleted_at=expense.deleted_at,
            vibe_social=expense.vibe_social,
            vibe_planning=expense.vibe_planning,
            vibe_necessity=expense.vibe_necessity,
            recurring_expense_uuid=new_recurring_uuid,
        )
        db.add(new_expense)
        db.flush()
        for category in expense.categories:
            new_uuid = category_uuid_map.get(category.uuid)
            if new_uuid:
                db.add(
                    ExpenseCategoryAssociation(
                        expense_uuid=new_expense.uuid, category_uuid=new_uuid,
                    ),
                )

    db.commit()
    return len(body.categories), len(body.expenses), len(recurring_uuid_map)
