from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.repository.database import get_db

health_router = APIRouter()


@health_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "BurnStyle API is running"}


@health_router.get("/health")
def health_check(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "healthy"}
