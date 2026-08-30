from __future__ import annotations

from typing import Annotated, cast

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.config import get_cron_secret
from src.domain.user import User
from src.infrastructure import recurring_expense_repository
from src.infrastructure.category_repository import get_category_by_uuid
from src.infrastructure.database import get_db
from src.infrastructure.recurring_expense_repository import RecurringExpensePatch
from src.presentation.deps import get_current_user, get_or_404
from src.presentation.schema.recurring_expense import (
    CronRecordResponse,
    RecordRecurringOccurrencesRequest,
    RecurringExpenseCreate,
    RecurringExpenseDueResponse,
    RecurringExpenseResponse,
    RecurringExpenseUpdate,
)
from src.service import recurring_expense_service

recurring_expense_router = APIRouter(prefix="/recurring-expenses", tags=["recurring-expenses"])


def _verify_user_category(db: Session, category_uuid: str, user_uuid: str) -> None:
    if not get_category_by_uuid(db, category_uuid, user_uuid):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")


@recurring_expense_router.get("")
def list_recurring(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[RecurringExpenseResponse]:
    recurring_expenses = recurring_expense_repository.get_all_active(db, str(user.uuid))
    return [RecurringExpenseResponse.model_validate(recurring_expense) for recurring_expense in recurring_expenses]


@recurring_expense_router.get("/due")
def list_due(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[RecurringExpenseDueResponse]:
    today = recurring_expense_service.jst_today()
    recurring_expenses = recurring_expense_repository.get_all_active(db, str(user.uuid))
    due_items: list[RecurringExpenseDueResponse] = []
    for recurring_expense in recurring_expenses:
        linked_expense_count = recurring_expense_repository.count_linked_expenses(
            db, str(recurring_expense.uuid),
        )
        dates = recurring_expense_service.missed_dates(recurring_expense, linked_expense_count, today)
        if not dates:
            continue
        due_items.append(
            RecurringExpenseDueResponse(
                uuid=str(recurring_expense.uuid),
                name=str(recurring_expense.name),
                amount=int(recurring_expense.amount),
                category=recurring_expense.category,
                missed_count=len(dates),
                missed_dates=dates,
            ),
        )
    return due_items


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

    recurring = recurring_expense_repository.create_recurring_expense(
        db,
        user_uuid=str(user.uuid),
        fields={
            "name": body.name,
            "amount": body.amount,
            "category_uuid": body.category_uuid,
            "interval_unit": body.interval_unit,
            "interval_count": body.interval_count,
            "start_date": body.start_date,
            "end_date": body.end_date,
        },
    )
    return RecurringExpenseResponse.model_validate(recurring)


@recurring_expense_router.get("/{uuid}")
def get_recurring(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RecurringExpenseResponse:
    recurring = get_or_404(
        recurring_expense_repository.get_recurring_expense_by_uuid(db, uuid, str(user.uuid)),
        "Recurring expense not found",
    )
    return RecurringExpenseResponse.model_validate(recurring)


@recurring_expense_router.patch("/{uuid}")
def update_recurring(
    uuid: str,
    body: RecurringExpenseUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RecurringExpenseResponse:
    recurring = get_or_404(
        recurring_expense_repository.get_recurring_expense_by_uuid(db, uuid, str(user.uuid)),
        "Recurring expense not found",
    )

    recurring_expense_patch = cast(RecurringExpensePatch, body.model_dump(exclude_unset=True))
    if "category_uuid" in recurring_expense_patch:
        _verify_user_category(db, recurring_expense_patch["category_uuid"], str(user.uuid))

    new_start = recurring_expense_patch.get("start_date", recurring.start_date)
    new_end = recurring_expense_patch.get("end_date", recurring.end_date)
    if new_end is not None and new_end < new_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be on or after start_date",
        )

    recurring = recurring_expense_repository.update_recurring_expense(
        db, recurring, recurring_expense_patch,
    )
    return RecurringExpenseResponse.model_validate(recurring)


@recurring_expense_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    recurring = get_or_404(
        recurring_expense_repository.get_recurring_expense_by_uuid(db, uuid, str(user.uuid)),
        "Recurring expense not found",
    )
    recurring_expense_repository.soft_delete(db, recurring)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@recurring_expense_router.post("/{uuid}/record")
def record_recurring(
    uuid: str,
    body: RecordRecurringOccurrencesRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, int]:
    recurring = get_or_404(
        recurring_expense_repository.get_recurring_expense_by_uuid(db, uuid, str(user.uuid)),
        "Recurring expense not found",
    )

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
