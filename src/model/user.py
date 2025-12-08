from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid6
from src.repository.database import Base


class User(Base):
    __tablename__ = "users"

    uuid = Column(String(32), primary_key=True, default=lambda: uuid6.uuid7().hex)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
