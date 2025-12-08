from sqlalchemy.orm import Session
from typing import List
from src.model.user import User


def get_all_users(db: Session) -> List[User]:
    """すべてのユーザーを取得する"""
    return db.query(User).all()

