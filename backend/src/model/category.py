from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


class Category(Base):
    __tablename__ = "categories"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    user_uuid = Column(String(32), ForeignKey("users.uuid", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    position = Column(Integer, nullable=False, default=0)

    user = relationship("User")

    # Many-to-many relationship
    expenses = relationship(
        "Expense",
        secondary="expense_category_association",
        back_populates="categories",
    )

