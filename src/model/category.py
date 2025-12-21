from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from src.repository.database import Base
from src.model import generate_uuid_string


class Category(Base):
    __tablename__ = "categories"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)

    # 多対多の関係
    transactions = relationship(
        "Transaction",
        secondary="transaction_category_association",
        back_populates="categories"
    )

