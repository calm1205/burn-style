from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from src.schema.category import CategoryResponse


class TransactionResponse(BaseModel):
    uuid: str
    name: str
    amount: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    categories: List[CategoryResponse]

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="正の整数のみ許可されます")
    category_uuids: List[str] = []

