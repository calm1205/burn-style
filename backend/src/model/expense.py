from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


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
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False,
    )
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User")

    # 多対多の関係
    categories = relationship(
        "Category",
        secondary="expense_category_association",
        back_populates="expenses",
    )

