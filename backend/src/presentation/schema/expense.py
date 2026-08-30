from __future__ import annotations

from pydantic import BaseModel, Field

from src.domain.expense import Expense
from src.domain.vibe import read_vibe_fields
from src.presentation.schema.category import ExpenseCategorySummary
from src.presentation.schema.types import JstDatetime, JstInputDatetime
from src.presentation.schema.vibe import NULL_VIBE, Vibe, vibe_fields_to_schema


class ExpenseResponse(BaseModel):
    uuid: str
    name: str
    amount: int
    expensed_at: JstDatetime
    created_at: JstDatetime
    updated_at: JstDatetime
    deleted_at: JstDatetime | None
    category: ExpenseCategorySummary | None
    vibe: Vibe
    recurring_expense_uuid: str | None

    @classmethod
    def from_expense(cls, expense: Expense) -> ExpenseResponse:
        category = expense.categories[0] if expense.categories else None
        return cls(
            uuid=str(expense.uuid),
            name=str(expense.name),
            amount=int(expense.amount),
            expensed_at=expense.expensed_at,  # type: ignore[arg-type]
            created_at=expense.created_at,  # type: ignore[arg-type]
            updated_at=expense.updated_at,  # type: ignore[arg-type]
            deleted_at=expense.deleted_at,  # type: ignore[arg-type]
            category=ExpenseCategorySummary.model_validate(category) if category else None,
            vibe=cls._response_vibe(expense),
            recurring_expense_uuid=(
                str(expense.recurring_expense_uuid) if expense.recurring_expense_uuid else None
            ),
        )

    @staticmethod
    def _response_vibe(expense: Expense) -> Vibe:
        if expense.recurring_expense_uuid:
            return NULL_VIBE.model_copy()
        return vibe_fields_to_schema(read_vibe_fields(expense))


class ExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="Must be a positive integer")
    expensed_at: JstInputDatetime
    category_uuid: str | None = None
    vibe: Vibe | None = None


class ExpenseUpdate(BaseModel):
    name: str | None = None
    amount: int | None = Field(default=None, gt=0, description="Must be a positive integer")
    expensed_at: JstInputDatetime | None = None
    category_uuid: str | None = None
    vibe: Vibe | None = None
