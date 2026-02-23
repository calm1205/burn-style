from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.schema.category import CategoryResponse


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    categories: list[CategoryResponse]


class ExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="正の整数のみ許可されます")
    category_uuids: list[str] = []

