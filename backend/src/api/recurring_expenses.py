from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from src.api.deps import get_current_user
from src.config import get_cron_secret
from src.model.category import Category
from src.model.recurring_expense import RecurringExpense
from src.model.user import User
from src.repository import recurring_expense_repository
from src.repository.database import get_db
from src.schema.recurring_expense import (
    CronRecordResponse,
    RecordRequest,
    RecurringExpenseCreate,
    RecurringExpenseDueResponse,
    RecurringExpenseResponse,
    RecurringExpenseUpdate,
)
from src.service import recurring_expense_service

recurring_expense_router = APIRouter(prefix="/recurring-expenses", tags=["recurring-expenses"])


def _verify_user_category(db: Session, category_uuid: str, user_uuid: str) -> None:
    category = (
        db.query(Category)
        .filter(Category.uuid == category_uuid, Category.user_uuid == user_uuid)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")


@recurring_expense_router.get("")
def list_recurring(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[RecurringExpenseResponse]:
    items = recurring_expense_repository.get_all_active(db, str(user.uuid))
    return [RecurringExpenseResponse.model_validate(r) for r in items]


@recurring_expense_router.get("/due")
def list_due(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[RecurringExpenseDueResponse]:
    today = recurring_expense_service.jst_today()
    items = recurring_expense_repository.get_all_active(db, str(user.uuid))
    result: list[RecurringExpenseDueResponse] = []
    for r in items:
        recorded = recurring_expense_repository.count_recorded(db, str(r.uuid))
        dates = recurring_expense_service.missed_dates(r, recorded, today)
        if not dates:
            continue
        result.append(
            RecurringExpenseDueResponse(
                uuid=str(r.uuid),
                name=str(r.name),
                amount=int(r.amount),
                category=r.category,
                missed_count=len(dates),
                missed_dates=dates,
            ),
        )
    return result


@recurring_expense_router.post("", status_code=status.HTTP_201_CREATED)
def create_recurring(
    body: RecurringExpenseCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RecurringExpenseResponse:
    _verify_user_category(db, body.category_uuid, str(user.uuid))

    if body.end_date is not None and body.end_date < body.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be on or after start_date",
        )

    recurring = RecurringExpense(
        user_uuid=user.uuid,
        name=body.name,
        amount=body.amount,
        category_uuid=body.category_uuid,
        interval_unit=body.interval_unit,
        interval_count=body.interval_count,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    db.add(recurring)
    db.commit()
    db.refresh(recurring)
    # Re-load with category eagerly
    loaded = (
        db.query(RecurringExpense)
        .options(joinedload(RecurringExpense.category))
        .filter(RecurringExpense.uuid == recurring.uuid)
        .one()
    )
    return RecurringExpenseResponse.model_validate(loaded)


@recurring_expense_router.get("/{uuid}")
def get_recurring(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RecurringExpenseResponse:
    recurring = recurring_expense_repository.get_by_uuid(db, uuid, str(user.uuid))
    if not recurring:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring expense not found")
    return RecurringExpenseResponse.model_validate(recurring)


@recurring_expense_router.patch("/{uuid}")
def update_recurring(
    uuid: str,
    body: RecurringExpenseUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RecurringExpenseResponse:
    recurring = recurring_expense_repository.get_by_uuid(db, uuid, str(user.uuid))
    if not recurring:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring expense not found")

    update_data = body.model_dump(exclude_unset=True)
    if "category_uuid" in update_data:
        _verify_user_category(db, update_data["category_uuid"], str(user.uuid))

    new_start = update_data.get("start_date", recurring.start_date)
    new_end = update_data.get("end_date", recurring.end_date)
    if new_end is not None and new_end < new_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be on or after start_date",
        )

    for key, value in update_data.items():
        setattr(recurring, key, value)
    db.commit()
    db.refresh(recurring)
    return RecurringExpenseResponse.model_validate(recurring)


@recurring_expense_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    recurring = recurring_expense_repository.get_by_uuid(db, uuid, str(user.uuid))
    if not recurring:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring expense not found")
    recurring_expense_repository.soft_delete(db, recurring)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@recurring_expense_router.post("/{uuid}/record")
def record_recurring(
    uuid: str,
    body: RecordRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, int]:
    recurring = recurring_expense_repository.get_by_uuid(db, uuid, str(user.uuid))
    if not recurring:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring expense not found")

    created = recurring_expense_service.record_occurrences(
        db, recurring, count=body.count, expensed_at_override=body.expensed_at,
    )
    return {"recorded_count": created}


cron_router = APIRouter(prefix="/cron/recurring-expenses", tags=["cron"])


def _verify_cron_secret(authorization: Annotated[str | None, Header()] = None) -> None:
    expected = f"Bearer {get_cron_secret()}"
    if authorization != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cron secret")


@cron_router.api_route("/record-due", methods=["GET", "POST"])
def cron_record_due(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[None, Depends(_verify_cron_secret)],
) -> CronRecordResponse:
    recorded, processed = recurring_expense_service.record_all_due_for_cron(db)
    return CronRecordResponse(
        recorded_count=recorded, processed_recurring_count=processed,
    )
