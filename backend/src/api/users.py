from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository.database import get_db
from src.repository.user_repository import delete_user, update_user
from src.schema.auth import UserResponse, UserUpdateRequest

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


@user_router.delete("/me", status_code=204)
def delete_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """現在のユーザーを削除"""
    delete_user(db, current_user)
