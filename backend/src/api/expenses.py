from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository.database import get_db
from src.repository.expense_repository import (
    create_expense,
    get_all_expenses,
    get_expense_by_uuid,
    soft_delete_expense,
)
from src.schema.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from src.service import expense_service

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
    expense = get_expense_by_uuid(db, uuid, str(user.uuid))
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
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
    )
    return ExpenseResponse.model_validate(expense)


@expense_router.patch("/{uuid}")
def patch_expense(
    uuid: str,
    body: ExpenseUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    expense = get_expense_by_uuid(db, uuid, str(user.uuid))
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    update_data = body.model_dump(exclude_unset=True)
    category_uuids: list[str] | None = None
    if "category_uuid" in body.model_fields_set:
        cat_uuid = update_data.pop("category_uuid")
        category_uuids = [cat_uuid] if cat_uuid else []

    expense = expense_service.update_expense(
        db, expense, str(user.uuid), update_data, category_uuids,
    )
    return ExpenseResponse.model_validate(expense)


@expense_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    expense = get_expense_by_uuid(db, uuid, str(user.uuid))
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    soft_delete_expense(db, expense)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
