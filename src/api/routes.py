from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.repository.database import get_db
from src.repository.user_repository import get_all_users
from src.schema.user import UserResponse

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Finance API is running"}


@router.get("/health")
async def health_check():
    return {"status": "healthy"}


@router.get("/users", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    """ユーザー一覧を取得する"""
    users = get_all_users(db)
    return users
