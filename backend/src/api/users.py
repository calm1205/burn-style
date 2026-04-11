from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.category import Category
from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.expense_template import ExpenseTemplate
from src.model.user import User
from src.repository.category_repository import get_all_categories
from src.repository.database import get_db
from src.repository.expense_repository import get_all_expenses
from src.repository.user_repository import delete_user, update_user
from src.schema.auth import UserResponse, UserUpdateRequest
from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse
from src.schema.user import UserExportResponse, UserImportRequest, UserImportResponse

user_router = APIRouter(tags=["users"])


@user_router.get("/me")
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    """現在のユーザー情報を返す"""
    return UserResponse.model_validate(current_user)


@user_router.patch("/me")
def update_me(
    body: UserUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """現在のユーザー情報を更新"""
    updated = update_user(db, current_user, body.name)
    return UserResponse.model_validate(updated)


@user_router.get("/me/export")
def export_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserExportResponse:
    """現在のユーザーの全データをエクスポート"""
    user_uuid = str(current_user.uuid)
    categories = get_all_categories(db, user_uuid)
    expenses = get_all_expenses(db, user_uuid, include_deleted=True)
    return UserExportResponse(
        name=str(current_user.name),
        categories=[CategoryResponse.model_validate(c) for c in categories],
        expenses=[ExpenseResponse.model_validate(e) for e in expenses],
    )


@user_router.post("/me/import")
def import_me(
    body: UserImportRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserImportResponse:
    """エクスポートしたJSONデータをインポート"""
    user_uuid = str(current_user.uuid)

    # 既存データを削除(FK制約を考慮した順序)
    db.query(ExpenseCategoryAssociation).filter(
        ExpenseCategoryAssociation.expense_uuid.in_(
            db.query(Expense.uuid).filter(Expense.user_uuid == user_uuid),
        ),
    ).delete(synchronize_session=False)
    db.query(ExpenseTemplate).filter(ExpenseTemplate.user_uuid == user_uuid).delete(synchronize_session=False)
    db.query(Expense).filter(Expense.user_uuid == user_uuid).delete(synchronize_session=False)
    db.query(Category).filter(Category.user_uuid == user_uuid).delete(synchronize_session=False)

    # カテゴリをインポート(旧UUID -> 新UUIDのマッピング)
    category_uuid_map: dict[str, str] = {}
    for cat in body.categories:
        new_category = Category(user_uuid=user_uuid, name=cat.name)
        db.add(new_category)
        db.flush()
        category_uuid_map[cat.uuid] = str(new_category.uuid)

    # 支出をインポート
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
            new_category_uuid = category_uuid_map.get(cat.uuid)
            if new_category_uuid:
                db.add(ExpenseCategoryAssociation(expense_uuid=expense.uuid, category_uuid=new_category_uuid))

    db.commit()

    return UserImportResponse(
        categories_count=len(body.categories),
        expenses_count=len(body.expenses),
        message=f"Imported {len(body.categories)} categories and {len(body.expenses)} expenses",
    )


@user_router.delete("/me", status_code=204)
def delete_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """現在のユーザーを削除"""
    delete_user(db, current_user)
