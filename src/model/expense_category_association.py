from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime, timezone
from src.repository.database import Base


# 多対多の関係を表す中間テーブル
class ExpenseCategoryAssociation(Base):
    __tablename__ = "expense_category_association"

    expense_uuid = Column(String(32), ForeignKey("expenses.uuid"), primary_key=True)
    category_uuid = Column(String(32), ForeignKey("categories.uuid"), primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

