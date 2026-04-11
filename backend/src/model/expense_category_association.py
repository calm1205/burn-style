from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, String

from src.repository.database import Base


# Association table for many-to-many relationship
class ExpenseCategoryAssociation(Base):
    __tablename__ = "expense_category_association"

    expense_uuid = Column(String(32), ForeignKey("expenses.uuid", ondelete="CASCADE"), primary_key=True)
    category_uuid = Column(String(32), ForeignKey("categories.uuid", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

