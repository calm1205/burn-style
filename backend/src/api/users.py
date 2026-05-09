from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository.database import get_db
from src.repository.user_repository import delete_user, update_user
from src.schema.auth import UserResponse, UserUpdateRequest
from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse
from src.schema.user import (
    ExportExpenseTemplateResponse,
    UserExportResponse,
    UserImportRequest,
    UserImportResponse,
)
from src.service import user_service

user_router = APIRouter(tags=["users"])


@user_router.get("/me")
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
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
    categories, expenses, templates = user_service.export_user_data(db, current_user)
    return UserExportResponse(
        name=str(current_user.name),
        categories=[CategoryResponse.model_validate(c) for c in categories],
        expenses=[ExpenseResponse.model_validate(e) for e in expenses],
        expense_templates=[ExportExpenseTemplateResponse.model_validate(t) for t in templates],
    )


@user_router.post("/me/import")
def import_me(
    body: UserImportRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserImportResponse:
    """既存データを全削除し、エクスポート済みJSONを再インポート。"""
    cat_count, exp_count, tmpl_count = user_service.import_user_data(db, current_user, body)
    return UserImportResponse(
        categories_count=cat_count,
        expenses_count=exp_count,
        expense_templates_count=tmpl_count,
        message=f"Imported {cat_count} categories, {exp_count} expenses, and {tmpl_count} templates",
    )


@user_router.delete("/me", status_code=204)
def delete_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """現在のユーザーを削除。"""
    delete_user(db, current_user)
