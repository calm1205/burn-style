from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from src.schema.category import CategoryResponse


class SubscriptionTemplateResponse(BaseModel):
    uuid: str
    name: str
    amount: int
    category: CategoryResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubscriptionTemplateCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="正の整数のみ許可")
    category_uuid: str


class SubscriptionTemplateUpdate(BaseModel):
    name: str | None = None
    amount: int | None = Field(default=None, gt=0, description="正の整数のみ許可")
    category_uuid: str | None = None


class BulkRecordRequest(BaseModel):
    template_uuids: list[str]


class BulkRecordResponse(BaseModel):
    created_count: int
    message: str
