from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository.category_repository import get_all_categories
from src.repository.database import get_db
from src.schema.category import CategoryResponse

category_router = APIRouter()


@category_router.get("/categories")
def get_categories(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryResponse]:
    categories = get_all_categories(db, str(user.uuid))
    return [CategoryResponse.model_validate(c) for c in categories]
