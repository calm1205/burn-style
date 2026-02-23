from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


class SubscriptionTemplate(Base):
    __tablename__ = "subscription_templates"
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_subscription_amount_positive"),
    )

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    user_uuid = Column(String(32), ForeignKey("users.uuid"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    category_uuid = Column(String(32), ForeignKey("categories.uuid"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False,
    )
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User")
    category = relationship("Category")
