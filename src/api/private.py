from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.model.category import Category
from src.repository.category_repository import (
    bulk_create_categories,
    delete_all_categories,
)
from src.repository.database import get_db
from src.schema.category import CategoryResponse

private_router = APIRouter(prefix="/private", tags=["private"])

SEED_CATEGORY_NAMES = [
    "食費",
    "交通費",
    "娯楽",
    "光熱費",
    "通信費",
    "医療費",
    "教育費",
    "給与",
    "賞与",
    "その他収入",
]


@private_router.post("/categories/seed", response_model=list[CategoryResponse])
def seed_categories(db: Annotated[Session, Depends(get_db)]) -> list[Category]:
    delete_all_categories(db)
    return bulk_create_categories(db, SEED_CATEGORY_NAMES)
