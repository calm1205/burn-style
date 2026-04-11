from __future__ import annotations

from sqlalchemy.orm import Session

from src.model.user import User


def get_user_by_name(db: Session, name: str) -> User | None:
    """Get a user by name."""
    return db.query(User).filter(User.name == name).first()


def get_user_by_uuid(db: Session, uuid: str) -> User | None:
    """Get a user by UUID."""
    return db.query(User).filter(User.uuid == uuid).first()


def create_user(db: Session, name: str) -> User:
    """Create a new user."""
    user = User(name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, name: str) -> User:
    """Update a user's name."""
    user.name = name  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """Delete a user."""
    db.delete(user)
    db.commit()
