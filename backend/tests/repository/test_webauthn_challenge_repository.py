from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from src.model.webauthn_challenge import WebAuthnChallenge
from src.repository.webauthn_challenge_repository import (
    CHALLENGE_TTL_SECONDS,
    save_challenge,
    take_challenge,
)


def test_take_returns_saved_challenge(db: Session) -> None:
    save_challenge(db, "alice", b"abc")
    assert take_challenge(db, "alice") == b"abc"


def test_take_consumes_challenge(db: Session) -> None:
    save_challenge(db, "alice", b"abc")
    take_challenge(db, "alice")
    assert take_challenge(db, "alice") is None


def test_take_returns_none_when_missing(db: Session) -> None:
    assert take_challenge(db, "ghost") is None


def test_save_overwrites_existing(db: Session) -> None:
    save_challenge(db, "alice", b"old")
    save_challenge(db, "alice", b"new")
    assert take_challenge(db, "alice") == b"new"


def test_expired_challenge_returns_none(db: Session) -> None:
    save_challenge(db, "alice", b"abc")
    expired_at = datetime.now(UTC) - timedelta(seconds=CHALLENGE_TTL_SECONDS + 1)
    db.query(WebAuthnChallenge).filter(WebAuthnChallenge.name == "alice").update(
        {WebAuthnChallenge.created_at: expired_at},
    )
    db.commit()

    assert take_challenge(db, "alice") is None
    # 期限切れ行も削除されていること
    assert db.query(WebAuthnChallenge).filter(WebAuthnChallenge.name == "alice").first() is None
