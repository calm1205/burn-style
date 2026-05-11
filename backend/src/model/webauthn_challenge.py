from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, LargeBinary, String

from src.repository.database import Base


class WebAuthnChallenge(Base):
    """register/signinの options→verify 間でchallengeを共有するための一時保存。

    サーバーレスでインメモリ共有が成立しないためDBで橋渡しする。
    """

    __tablename__ = "webauthn_challenges"

    name = Column(String, primary_key=True)
    challenge = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
