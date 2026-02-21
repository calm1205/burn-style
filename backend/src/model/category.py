from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


class Category(Base):
    __tablename__ = "categories"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)

    # 多対多の関係
    expenses = relationship(
        "Expense",
        secondary="expense_category_association",
        back_populates="categories",
    )

