from sqlalchemy import Column, String, DateTime, Float, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.repository.database import Base
from src.model import generate_uuid_string

# 多対多の関係を表す中間テーブル
transaction_category_association = Table(
    "transaction_category_association",
    Base.metadata,
    Column("transaction_uuid", String(32), ForeignKey("transactions.uuid"), primary_key=True),
    Column("category_uuid", String(32), ForeignKey("categories.uuid"), primary_key=True),
)


class Transaction(Base):
    __tablename__ = "transactions"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)

    # 多対多の関係
    categories = relationship(
        "Category",
        secondary=transaction_category_association,
        back_populates="transactions"
    )

