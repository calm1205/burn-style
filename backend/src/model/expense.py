from __future__ import annotations

import enum
from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


class VibeSocial(str, enum.Enum):
    SOLO = "SOLO"
    WITH_SOMEONE = "WITH_SOMEONE"


class VibePlanning(str, enum.Enum):
    ROUTINE = "ROUTINE"
    SPONTANEOUS = "SPONTANEOUS"


class VibeNecessity(str, enum.Enum):
    NEEDED = "NEEDED"
    WANTED = "WANTED"


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_amount_positive"),
    )

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    user_uuid = Column(String(32), ForeignKey("users.uuid", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    expensed_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    recurring_expense_uuid = Column(
        String(32),
        ForeignKey("recurring_expenses.uuid", ondelete="SET NULL"),
        nullable=True,
    )
    vibe_social: Column[VibeSocial | None] = Column(
        Enum(VibeSocial, name="vibe_social"), nullable=True,
    )
    vibe_planning: Column[VibePlanning | None] = Column(
        Enum(VibePlanning, name="vibe_planning"), nullable=True,
    )
    vibe_necessity: Column[VibeNecessity | None] = Column(
        Enum(VibeNecessity, name="vibe_necessity"), nullable=True,
    )
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False,
    )
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User")
    recurring_expense = relationship("RecurringExpense")

    # Many-to-many relationship
    categories = relationship(
        "Category",
        secondary="expense_category_association",
        back_populates="expenses",
    )

