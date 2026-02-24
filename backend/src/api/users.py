from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from src.api.deps import get_current_user
from src.model.user import User
from src.schema.auth import UserResponse

user_router = APIRouter(tags=["users"])


@user_router.get("/me")
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    """現在のユーザー情報を返す"""
    return UserResponse.model_validate(current_user)
