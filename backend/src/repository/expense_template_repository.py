from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session, joinedload

from src.model.expense_template import ExpenseTemplate


def get_all_active(db: Session, user_uuid: str) -> list[ExpenseTemplate]:
    """ユーザーの未削除テンプレート一覧を取得 (categoryをeager load)。"""
    return (
        db.query(ExpenseTemplate)
        .options(joinedload(ExpenseTemplate.category))
        .filter(
            ExpenseTemplate.user_uuid == user_uuid,
            ExpenseTemplate.deleted_at.is_(None),
        )
        .all()
    )


def get_all_including_deleted(db: Session, user_uuid: str) -> list[ExpenseTemplate]:
    """ユーザーの全テンプレート (削除済み含む) を取得 (export用)。"""
    return (
        db.query(ExpenseTemplate)
        .options(joinedload(ExpenseTemplate.category))
        .filter(ExpenseTemplate.user_uuid == user_uuid)
        .all()
    )


def delete_all_for_user(db: Session, user_uuid: str) -> None:
    """ユーザーの全テンプレートを物理削除 (import前リセット用)。"""
    db.query(ExpenseTemplate).filter(
        ExpenseTemplate.user_uuid == user_uuid,
    ).delete(synchronize_session=False)


def get_by_uuid(db: Session, uuid: str, user_uuid: str) -> ExpenseTemplate | None:
    """単体取得 (categoryをeager load、未削除のみ)。"""
    return (
        db.query(ExpenseTemplate)
        .options(joinedload(ExpenseTemplate.category))
        .filter(
            ExpenseTemplate.uuid == uuid,
            ExpenseTemplate.user_uuid == user_uuid,
            ExpenseTemplate.deleted_at.is_(None),
        )
        .first()
    )


def get_active_by_uuids(
    db: Session, uuids: list[str], user_uuid: str,
) -> list[ExpenseTemplate]:
    """複数UUIDで一括取得 (bulk-record用)。"""
    return (
        db.query(ExpenseTemplate)
        .filter(
            ExpenseTemplate.uuid.in_(uuids),
            ExpenseTemplate.user_uuid == user_uuid,
            ExpenseTemplate.deleted_at.is_(None),
        )
        .all()
    )


def create(db: Session, user_uuid: str, name: str, amount: int, category_uuid: str) -> ExpenseTemplate:
    """新規作成。"""
    template = ExpenseTemplate(
        user_uuid=user_uuid, name=name, amount=amount, category_uuid=category_uuid,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def update(db: Session, template: ExpenseTemplate, fields: dict[str, Any]) -> ExpenseTemplate:
    """指定フィールドのみ更新。"""
    for key, value in fields.items():
        setattr(template, key, value)
    db.commit()
    db.refresh(template)
    return template


def soft_delete(db: Session, template: ExpenseTemplate) -> None:
    """deleted_at を立てて論理削除。"""
    template.deleted_at = datetime.now(UTC)  # type: ignore[assignment]
    db.commit()
