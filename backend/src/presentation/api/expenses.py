from __future__ import annotations

from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from src.domain.user import User
from src.infrastructure import expense_repository
from src.infrastructure.database import get_db
from src.presentation.deps import get_current_user, get_or_404
from src.presentation.schema.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from src.presentation.schema.vibe import vibe_from_schema
from src.service import expense_service
from src.service.expense_service import ExpensePatch

expense_router = APIRouter(prefix="/expenses", tags=["expenses"])


@expense_router.get("")
def list_expenses(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    year: Annotated[int | None, Query()] = None,
    month: Annotated[int | None, Query()] = None,
) -> list[ExpenseResponse]:
    expenses = expense_repository.get_all_expenses(db, str(user.uuid), year=year, month=month)
    return [ExpenseResponse.from_expense(expense) for expense in expenses]


@expense_router.get("/{uuid}")
def get_expense(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    expense = get_or_404(
        expense_repository.get_expense_by_uuid(db, uuid, str(user.uuid)), "Expense not found",
    )
    return ExpenseResponse.from_expense(expense)


@expense_router.post("", status_code=status.HTTP_201_CREATED)
def create_expense(
    body: ExpenseCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    vibe = vibe_from_schema(body.vibe)
    expense = expense_repository.create_expense(
        db, str(user.uuid), body.name, body.amount, body.expensed_at,
        category_uuids=[body.category_uuid] if body.category_uuid else None,
        vibe=vibe,
    )
    return ExpenseResponse.from_expense(expense)


@expense_router.patch("/{uuid}")
def update_expense(
    uuid: str,
    body: ExpenseUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    expense = get_or_404(
        expense_repository.get_expense_by_uuid(db, uuid, str(user.uuid)), "Expense not found",
    )

    raw_patch = body.model_dump(exclude_unset=True)
    category_uuids: list[str] | None = None
    if "category_uuid" in body.model_fields_set:
        cat_uuid = raw_patch.pop("category_uuid")
        category_uuids = [cat_uuid] if cat_uuid else []

    vibe_set = "vibe" in body.model_fields_set
    if vibe_set:
        raw_patch.pop("vibe", None)

    expense_patch = cast(ExpensePatch, raw_patch)
    if vibe_set:
        expense_patch["vibe"] = vibe_from_schema(body.vibe)

    expense = expense_service.update_expense(
        db, expense, str(user.uuid), expense_patch, category_uuids, vibe_set=vibe_set,
    )
    return ExpenseResponse.from_expense(expense)


@expense_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    expense = get_or_404(
        expense_repository.get_expense_by_uuid(db, uuid, str(user.uuid)), "Expense not found",
    )

    expense_repository.soft_delete_expense(db, expense)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
