from __future__ import annotations

import datetime as dt

from sqlalchemy.orm import Session, selectinload

from src.model.category import Category
from src.model.expense import Expense, VibeNecessity, VibePlanning, VibeSocial

JST = dt.timezone(dt.timedelta(hours=9))
DECEMBER = 12

def get_all_expenses(
    db: Session,
    user_uuid: str,
    *,
    year: int | None = None,
    month: int | None = None,
    include_deleted: bool = False,
) -> list[Expense]:
    """支出一覧を取得 (デフォルトは未削除のみ)。"""
    query = db.query(Expense).options(selectinload(Expense.categories)).filter(Expense.user_uuid == user_uuid)
    if not include_deleted:
        query = query.filter(Expense.deleted_at.is_(None))
    if year is not None:
        if month is not None:
            jst_start = dt.datetime(year, month, 1, tzinfo=JST)
            if month == DECEMBER:
                jst_next = dt.datetime(year + 1, 1, 1, tzinfo=JST)
            else:
                jst_next = dt.datetime(year, month + 1, 1, tzinfo=JST)
        else:
            jst_start = dt.datetime(year, 1, 1, tzinfo=JST)
            jst_next = dt.datetime(year + 1, 1, 1, tzinfo=JST)
        utc_start = jst_start.astimezone(dt.UTC).replace(tzinfo=None)
        utc_next = jst_next.astimezone(dt.UTC).replace(tzinfo=None)
        query = query.filter(Expense.expensed_at >= utc_start, Expense.expensed_at < utc_next)
    return query.all()


def get_expense_by_uuid(db: Session, uuid: str, user_uuid: str) -> Expense | None:
    """UUIDで支出を取得 (categoryをeager load)。"""
    return db.query(Expense).options(selectinload(Expense.categories)).filter(
        Expense.uuid == uuid,
        Expense.user_uuid == user_uuid,
        Expense.deleted_at.is_(None),
    ).first()


def create_expense(  # noqa: PLR0913
    db: Session,
    user_uuid: str,
    name: str,
    amount: float,
    expensed_at: dt.datetime,
    *,
    category_uuids: list[str] | None = None,
    vibe_social: VibeSocial | None = None,
    vibe_planning: VibePlanning | None = None,
    vibe_necessity: VibeNecessity | None = None,
) -> Expense:
    """支出を新規作成。"""
    expense = Expense(
        user_uuid=user_uuid,
        name=name,
        amount=amount,
        expensed_at=expensed_at,
        vibe_social=vibe_social,
        vibe_planning=vibe_planning,
        vibe_necessity=vibe_necessity,
    )

    if category_uuids:
        categories = db.query(Category).filter(
            Category.uuid.in_(category_uuids),
            Category.user_uuid == user_uuid,
        ).all()
        expense.categories = categories

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def update_expense_categories(db: Session, expense: Expense, user_uuid: str, category_uuids: list[str]) -> None:
    """支出のカテゴリを再リンク。"""
    categories = db.query(Category).filter(
        Category.uuid.in_(category_uuids),
        Category.user_uuid == user_uuid,
    ).all()
    expense.categories = categories


def soft_delete_expense(db: Session, expense: Expense) -> None:
    """支出を論理削除。"""
    expense.deleted_at = dt.datetime.now(dt.UTC)  # type: ignore[assignment]
    db.commit()


def delete_all_for_user(db: Session, user_uuid: str) -> None:
    """ユーザーの全Expenseを物理削除 (import前リセット用)。FK CASCADEでassociationも消える。"""
    db.query(Expense).filter(Expense.user_uuid == user_uuid).delete(synchronize_session=False)


def bulk_create(db: Session, expenses: list[Expense]) -> None:
    """複数Expenseを一括追加 (commitは呼び元)。"""
    db.add_all(expenses)
    db.flush()
