from __future__ import annotations

from pydantic import BaseModel

from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse


class UserExportResponse(BaseModel):
    name: str
    categories: list[CategoryResponse]
    expenses: list[ExpenseResponse]
