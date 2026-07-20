from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import relationship

from src.domain.base import Base
from src.domain.utils import generate_uuid_string


class User(Base):
    __tablename__ = "users"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False,
    )

    webauthn_credentials = relationship(
        "WebAuthnCredential", back_populates="user", cascade="all, delete-orphan", passive_deletes=True,
    )
    categories = relationship(
        "Category", cascade="all, delete-orphan", passive_deletes=True, overlaps="user",
    )
    expenses = relationship(
        "Expense", cascade="all, delete-orphan", passive_deletes=True, overlaps="user",
    )
