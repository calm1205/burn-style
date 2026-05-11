from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from src.model.webauthn_challenge import WebAuthnChallenge

CHALLENGE_TTL_SECONDS = 300


def save_challenge(db: Session, name: str, challenge: bytes) -> None:
    """name単位でchallengeを保存。同一nameが既にあれば置換。"""
    db.query(WebAuthnChallenge).filter(WebAuthnChallenge.name == name).delete()
    db.add(WebAuthnChallenge(name=name, challenge=challenge, created_at=datetime.now(UTC)))
    db.commit()


def take_challenge(db: Session, name: str) -> bytes | None:
    """challengeを取り出して削除。TTL超過分はNone返却 + 削除。"""
    row = db.query(WebAuthnChallenge).filter(WebAuthnChallenge.name == name).first()
    if row is None:
        return None

    challenge: bytes = row.challenge  # type: ignore[assignment]
    created_at: datetime = row.created_at  # type: ignore[assignment]
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=UTC)

    db.delete(row)
    db.commit()

    if datetime.now(UTC) - created_at > timedelta(seconds=CHALLENGE_TTL_SECONDS):
        return None
    return challenge
