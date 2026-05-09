from __future__ import annotations

import enum
from datetime import UTC, datetime

from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


class IntervalUnit(str, enum.Enum):
    WEEK = "WEEK"
    MONTH = "MONTH"


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_recurring_expense_amount_positive"),
        CheckConstraint("interval_count > 0", name="check_recurring_expense_interval_count_positive"),
    )

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    user_uuid = Column(String(32), ForeignKey("users.uuid", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    category_uuid = Column(String(32), ForeignKey("categories.uuid", ondelete="CASCADE"), nullable=False)
    interval_unit: Column[IntervalUnit] = Column(
        Enum(IntervalUnit, name="interval_unit"), nullable=False,
    )
    interval_count = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False,
    )
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User")
    category = relationship("Category")
