from __future__ import annotations

from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from src.domain.user import User
from src.infrastructure.database import get_db
from src.infrastructure.expense_repository import (
    create_expense,
    get_all_expenses,
    get_expense_by_uuid,
    soft_delete_expense,
)
from src.presentation.deps import get_current_user, get_or_404
from src.presentation.schema.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
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
    expenses = get_all_expenses(db, str(user.uuid), year=year, month=month)
    return [ExpenseResponse.model_validate(e) for e in expenses]


@expense_router.get("/{uuid}")
def get_expense(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    expense = get_or_404(get_expense_by_uuid(db, uuid, str(user.uuid)), "Expense not found")
    return ExpenseResponse.model_validate(expense)


@expense_router.post("", status_code=status.HTTP_201_CREATED)
def post_expense(
    body: ExpenseCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    expense = create_expense(
        db, str(user.uuid), body.name, body.amount, body.expensed_at,
        category_uuids=[body.category_uuid] if body.category_uuid else None,
        vibe_social=body.vibe_social,
        vibe_planning=body.vibe_planning,
        vibe_necessity=body.vibe_necessity,
    )
    return ExpenseResponse.model_validate(expense)


@expense_router.patch("/{uuid}")
def patch_expense(
    uuid: str,
    body: ExpenseUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    expense = get_or_404(get_expense_by_uuid(db, uuid, str(user.uuid)), "Expense not found")

    raw_patch = body.model_dump(exclude_unset=True)
    category_uuids: list[str] | None = None
    if "category_uuid" in body.model_fields_set:
        cat_uuid = raw_patch.pop("category_uuid")
        category_uuids = [cat_uuid] if cat_uuid else []

    expense_patch = cast(ExpensePatch, raw_patch)

    expense = expense_service.update_expense(
        db, expense, str(user.uuid), expense_patch, category_uuids,
    )
    return ExpenseResponse.model_validate(expense)


@expense_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    expense = get_or_404(get_expense_by_uuid(db, uuid, str(user.uuid)), "Expense not found")

    soft_delete_expense(db, expense)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
