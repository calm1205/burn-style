from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from src.repository.database import Base
from src.model import generate_uuid_string


class User(Base):
    __tablename__ = "users"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
