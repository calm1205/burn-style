from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.repository.database import get_db
from src.repository.user_repository import get_all_users
from src.repository.expense_repository import get_expenses_by_user_uuid
from src.schema.user import UserResponse
from src.schema.expense import ExpenseResponse

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Finance API is running"}


@router.get("/health")
async def health_check():
    return {"status": "healthy"}


@router.get("/users/{user_uuid}/expenses", response_model=List[ExpenseResponse])
async def get_expenses_by_user(
    user_uuid: str,
    db: Session = Depends(get_db)
):
    """指定されたユーザーの支出を取得する"""
    expenses = get_expenses_by_user_uuid(db, user_uuid)
    return expenses
