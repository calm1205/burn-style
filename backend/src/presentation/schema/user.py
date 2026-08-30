from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict

from src.domain.recurring_expense import IntervalUnit
from src.presentation.schema.category import CategoryResponse
from src.presentation.schema.expense import ExpenseResponse
from src.presentation.schema.types import JstDatetime, JstInputDatetime
from src.presentation.schema.vibe import Vibe


class ExportRecurringExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    category_uuid: str
    interval_unit: IntervalUnit
    interval_count: int
    start_date: date
    end_date: date | None
    created_at: JstDatetime
    updated_at: JstDatetime
    deleted_at: JstDatetime | None


class UserExportResponse(BaseModel):
    name: str
    categories: list[CategoryResponse]
    expenses: list[ExpenseResponse]
    recurring_expenses: list[ExportRecurringExpenseResponse]


class ImportCategory(BaseModel):
    uuid: str
    name: str
    symbol: str | None = None
    position: int = 0


class ImportRecurringExpense(BaseModel):
    uuid: str
    name: str
    amount: int
    category_uuid: str
    interval_unit: IntervalUnit
    interval_count: int
    start_date: date
    end_date: date | None = None
    created_at: JstInputDatetime
    updated_at: JstInputDatetime
    deleted_at: JstInputDatetime | None = None


class ImportExpenseCategory(BaseModel):
    uuid: str
    name: str


class ImportExpense(BaseModel):
    name: str
    amount: int
    expensed_at: JstInputDatetime
    created_at: JstInputDatetime
    updated_at: JstInputDatetime
    deleted_at: JstInputDatetime | None = None
    category: ImportExpenseCategory | None = None
    vibe: Vibe | None = None
    recurring_expense_uuid: str | None = None


class UserImportRequest(BaseModel):
    categories: list[ImportCategory]
    expenses: list[ImportExpense]
    recurring_expenses: list[ImportRecurringExpense] = []


class UserImportResponse(BaseModel):
    categories_count: int
    expenses_count: int
    recurring_expenses_count: int
    message: str
