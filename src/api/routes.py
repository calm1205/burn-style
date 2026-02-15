from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.model.category import Category
from src.repository.category_repository import get_all_categories
from src.repository.database import get_db
from src.schema.category import CategoryResponse

router = APIRouter()


@router.get("/")
async def root() -> dict[str, str]:
    return {"message": "Finance API is running"}


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Annotated[Session, Depends(get_db)]) -> list[Category]:
    return get_all_categories(db)
