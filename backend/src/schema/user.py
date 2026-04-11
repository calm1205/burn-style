from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse
from src.schema.types import JstDatetime, JstInputDatetime


class ExportExpenseTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    category: CategoryResponse
    created_at: JstDatetime
    updated_at: JstDatetime
    deleted_at: JstDatetime | None


class UserExportResponse(BaseModel):
    name: str
    categories: list[CategoryResponse]
    expenses: list[ExpenseResponse]
    expense_templates: list[ExportExpenseTemplateResponse]


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


class ImportExpenseTemplate(BaseModel):
    name: str
    amount: int
    category: ImportCategory
    created_at: JstInputDatetime
    updated_at: JstInputDatetime
    deleted_at: JstInputDatetime | None = None


class UserImportRequest(BaseModel):
    categories: list[ImportCategory]
    expenses: list[ImportExpense]
    expense_templates: list[ImportExpenseTemplate] = []


class UserImportResponse(BaseModel):
    categories_count: int
    expenses_count: int
    expense_templates_count: int
    message: str
