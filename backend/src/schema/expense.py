from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.schema.category import CategoryResponse


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    expensed_at: datetime
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    categories: list[CategoryResponse]


class ExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="正の整数のみ許可")
    expensed_at: datetime
    category_uuids: list[str] = []


class ExpenseUpdate(BaseModel):
    name: str | None = None
    amount: int | None = Field(default=None, gt=0, description="正の整数のみ許可")
    expensed_at: datetime | None = None
    category_uuids: list[str] | None = None

