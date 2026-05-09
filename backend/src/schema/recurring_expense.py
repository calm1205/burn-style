from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from src.model.recurring_expense import IntervalUnit
from src.schema.category import CategoryResponse
from src.schema.types import JstDatetime


class RecurringExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    category: CategoryResponse
    interval_unit: IntervalUnit
    interval_count: int
    start_date: date
    end_date: date | None
    created_at: JstDatetime
    updated_at: JstDatetime


class RecurringExpenseCreate(BaseModel):
    name: str
    amount: int = Field(gt=0, description="Must be a positive integer")
    category_uuid: str
    interval_unit: IntervalUnit
    interval_count: int = Field(gt=0, description="Must be a positive integer")
    start_date: date
    end_date: date | None = None


class RecurringExpenseUpdate(BaseModel):
    name: str | None = None
    amount: int | None = Field(default=None, gt=0)
    category_uuid: str | None = None
    interval_unit: IntervalUnit | None = None
    interval_count: int | None = Field(default=None, gt=0)
    start_date: date | None = None
    end_date: date | None = None


class RecurringExpenseDueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    name: str
    amount: int
    category: CategoryResponse
    missed_count: int
    missed_dates: list[date]


class RecordRequest(BaseModel):
    count: int = Field(default=1, gt=0, description="Number of occurrences to record")
    expensed_at: date | None = None


class CronRecordResponse(BaseModel):
    recorded_count: int
    processed_recurring_count: int
