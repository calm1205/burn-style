from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.user import User


def get_user_by_username(db: Session, username: str) -> User | None:
    """ユーザー名でユーザーを取得"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_uuid(db: Session, uuid: str) -> User | None:
    """UUIDでユーザーを取得"""
    return db.query(User).filter(User.uuid == uuid).first()


def create_user(db: Session, username: str) -> User:
    """新しいユーザーを作成"""
    user = User(username=username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
