from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
import uuid6
from src.repository.database import Base


def generate_uuid_string() -> str:
    """UUID v7をハイフンなしの32文字の文字列として生成"""
    return uuid6.uuid7().hex


class User(Base):
    __tablename__ = "users"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
