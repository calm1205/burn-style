from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from src.schema.category import CategoryResponse


class TransactionResponse(BaseModel):
    uuid: str
    name: str
    amount: float
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    categories: List[CategoryResponse]

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    name: str
    amount: float
    category_uuids: List[str] = []

