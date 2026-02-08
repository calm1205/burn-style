from sqlalchemy import Column, String, DateTime, Integer, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.repository.database import Base
from src.model.utils import generate_uuid_string


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = (
        CheckConstraint('amount > 0', name='check_amount_positive'),
    )

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)

    # 多対多の関係
    categories = relationship(
        "Category",
        secondary="expense_category_association",
        back_populates="expenses"
    )

