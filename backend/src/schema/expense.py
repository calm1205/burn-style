from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from src.model.expense import VibeNecessity, VibePlanning, VibeSocial
from src.schema.category import CategoryResponse
from src.schema.types import JstDatetime, JstInputDatetime


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    expensed_at: JstDatetime
    created_at: JstDatetime
    updated_at: JstDatetime
    deleted_at: JstDatetime | None
    categories: list[CategoryResponse]
    vibe_social: VibeSocial | None
    vibe_planning: VibePlanning | None
    vibe_necessity: VibeNecessity | None
    recurring_expense_uuid: str | None


class ExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="Must be a positive integer")
    expensed_at: JstInputDatetime
    category_uuid: str | None = None
    vibe_social: VibeSocial | None = None
    vibe_planning: VibePlanning | None = None
    vibe_necessity: VibeNecessity | None = None


class ExpenseUpdate(BaseModel):
    name: str | None = None
    amount: int | None = Field(default=None, gt=0, description="Must be a positive integer")
    expensed_at: JstInputDatetime | None = None
    category_uuid: str | None = None
    vibe_social: VibeSocial | None = None
    vibe_planning: VibePlanning | None = None
    vibe_necessity: VibeNecessity | None = None
