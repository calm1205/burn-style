from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from src.schema.category import CategoryResponse
from src.schema.types import JstDatetime


class ExpenseTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    category: CategoryResponse
    created_at: JstDatetime
    updated_at: JstDatetime


class ExpenseTemplateCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="正の整数のみ許可")
    category_uuid: str


class ExpenseTemplateUpdate(BaseModel):
    name: str | None = None
    amount: int | None = Field(default=None, gt=0, description="正の整数のみ許可")
    category_uuid: str | None = None


class BulkRecordRequest(BaseModel):
    template_uuids: list[str]


class BulkRecordResponse(BaseModel):
    created_count: int
    message: str
