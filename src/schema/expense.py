from datetime import datetime

from pydantic import BaseModel, Field

from src.schema.category import CategoryResponse


class ExpenseResponse(BaseModel):
    uuid: str
    name: str
    amount: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    categories: list[CategoryResponse]

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="正の整数のみ許可されます")
    category_uuids: list[str] = []

