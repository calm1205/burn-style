from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from src.repository.database import Base
from src.model.utils import generate_uuid_string


class Category(Base):
    __tablename__ = "categories"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)
    user_uuid = Column(String(32), ForeignKey("users.uuid"), nullable=False)

    # 多対一の関係
    user = relationship("User", back_populates="categories")

    # 多対多の関係
    expenses = relationship(
        "Expense",
        secondary="expense_category_association",
        back_populates="categories"
    )

