from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.domain.user import User
from src.infrastructure.database import get_db
from src.infrastructure.user_repository import delete_user, update_user
from src.presentation.deps import get_current_user
from src.presentation.schema.auth import UserResponse, UserUpdateRequest
from src.presentation.schema.category import CategoryResponse
from src.presentation.schema.expense import ExpenseResponse
from src.presentation.schema.user import (
    ExportRecurringExpenseResponse,
    UserExportResponse,
    UserImportRequest,
    UserImportResponse,
)
from src.service import user_service

user_router = APIRouter(tags=["users"])


@user_router.get("/me")
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    """現在のユーザー情報を返す。"""
    return UserResponse.model_validate(current_user)


@user_router.patch("/me")
def update_me(
    body: UserUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """ユーザー名を更新。"""
    updated = update_user(db, current_user, body.name)
    return UserResponse.model_validate(updated)


@user_router.get("/me/export")
def export_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserExportResponse:
    """現在のユーザーの全データをエクスポート。"""
    categories, expenses, recurring_expenses = user_service.export_user_snapshot(db, current_user)
    return UserExportResponse(
        name=str(current_user.name),
        categories=[CategoryResponse.model_validate(c) for c in categories],
        expenses=[ExpenseResponse.model_validate(e) for e in expenses],
        recurring_expenses=[ExportRecurringExpenseResponse.model_validate(r) for r in recurring_expenses],
    )


@user_router.post("/me/import")
def import_me(
    body: UserImportRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserImportResponse:
    """既存データを全削除し、エクスポート済みJSONを再インポート。"""
    categories_count, expenses_count, recurring_expenses_count = user_service.import_user_snapshot(
        db, current_user, body,
    )
    return UserImportResponse(
        categories_count=categories_count,
        expenses_count=expenses_count,
        recurring_expenses_count=recurring_expenses_count,
        message=(
            f"Imported {categories_count} categories, {expenses_count} expenses, "
            f"and {recurring_expenses_count} recurring expenses"
        ),
    )


@user_router.delete("/me", status_code=204)
def delete_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """現在のユーザーを削除。"""
    delete_user(db, current_user)
