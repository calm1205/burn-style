from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository.category_repository import get_all_categories
from src.repository.database import get_db
from src.repository.expense_repository import get_all_expenses
from src.repository.user_repository import delete_user, update_user
from src.schema.auth import UserResponse, UserUpdateRequest
from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse
from src.schema.user import UserExportResponse

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


@user_router.delete("/me", status_code=204)
def delete_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """現在のユーザーを削除"""
    delete_user(db, current_user)
