from __future__ import annotations

import time


class ChallengeStore:
    """In-memory store for WebAuthn challenges (TTL 5 min)."""

    def __init__(self, ttl_seconds: int = 300) -> None:
        self._store: dict[str, tuple[bytes, float]] = {}
        self._ttl = ttl_seconds

    def save(self, name: str, challenge: bytes) -> None:
        """Save a challenge."""
        self._cleanup()
        self._store[name] = (challenge, time.monotonic())

    def get(self, name: str) -> bytes | None:
        """Retrieve and remove a challenge."""
        self._cleanup()
        entry = self._store.pop(name, None)
        if entry is None:
            return None
        challenge, _ = entry
        return challenge

    def _cleanup(self) -> None:
        """Remove expired entries."""
        now = time.monotonic()
        expired = [k for k, (_, ts) in self._store.items() if now - ts > self._ttl]
        for k in expired:
            del self._store[k]


challenge_store = ChallengeStore()
