from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.user import User


def get_user_by_name(db: Session, name: str) -> User | None:
    """ユーザー名でユーザーを取得。"""
    return db.query(User).filter(User.name == name).first()


def get_user_by_uuid(db: Session, uuid: str) -> User | None:
    """UUIDでユーザーを取得。"""
    return db.query(User).filter(User.uuid == uuid).first()


def create_user(db: Session, name: str) -> User:
    """ユーザーを新規作成。"""
    user = User(name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, name: str) -> User:
    """ユーザー名を更新。"""
    user.name = name  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """ユーザーを削除。"""
    db.delete(user)
    db.commit()
