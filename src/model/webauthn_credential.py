from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String, Text
from sqlalchemy.orm import relationship

from src.model.utils import generate_uuid_string
from src.repository.database import Base


class WebAuthnCredential(Base):
    __tablename__ = "webauthn_credentials"

    uuid = Column(String(32), primary_key=True, default=generate_uuid_string)
    user_uuid = Column(String(32), ForeignKey("users.uuid"), nullable=False)
    credential_id = Column(LargeBinary, unique=True, nullable=False)
    credential_public_key = Column(LargeBinary, nullable=False)
    sign_count = Column(Integer, nullable=False, default=0)
    transports = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False,
    )

    user = relationship("User", back_populates="webauthn_credentials")
