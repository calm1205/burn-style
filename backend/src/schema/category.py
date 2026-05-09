from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    symbol: str | None
    position: int


class CategoryCreate(BaseModel):
    name: str
    symbol: str | None = Field(default=None, max_length=8)


class CategoryUpdate(BaseModel):
    name: str | None = None
    symbol: str | None = Field(default=None, max_length=8)


class CategoryMergeRequest(BaseModel):
    target_uuid: str


class CategoryReorderRequest(BaseModel):
    uuids: list[str]

