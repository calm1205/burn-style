from __future__ import annotations

from pydantic import BaseModel

from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse
from src.schema.types import JstInputDatetime


class UserExportResponse(BaseModel):
    name: str
    categories: list[CategoryResponse]
    expenses: list[ExpenseResponse]


class ImportCategory(BaseModel):
    uuid: str
    name: str


class ImportExpense(BaseModel):
    name: str
    amount: int
    expensed_at: JstInputDatetime
    created_at: JstInputDatetime
    updated_at: JstInputDatetime
    deleted_at: JstInputDatetime | None = None
    categories: list[ImportCategory]


class UserImportRequest(BaseModel):
    categories: list[ImportCategory]
    expenses: list[ImportExpense]


class UserImportResponse(BaseModel):
    categories_count: int
    expenses_count: int
    message: str
