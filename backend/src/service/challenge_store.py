from __future__ import annotations

import time


class ChallengeStore:
    """WebAuthnチャレンジの一時保存(インメモリ, TTL 5分)"""

    def __init__(self, ttl_seconds: int = 300) -> None:
        self._store: dict[str, tuple[bytes, float]] = {}
        self._ttl = ttl_seconds

    def save(self, name: str, challenge: bytes) -> None:
        """チャレンジを保存"""
        self._cleanup()
        self._store[name] = (challenge, time.monotonic())

    def get(self, name: str) -> bytes | None:
        """チャレンジを取得して削除"""
        self._cleanup()
        entry = self._store.pop(name, None)
        if entry is None:
            return None
        challenge, _ = entry
        return challenge

    def _cleanup(self) -> None:
        """期限切れエントリを削除"""
        now = time.monotonic()
        expired = [k for k, (_, ts) in self._store.items() if now - ts > self._ttl]
        for k in expired:
            del self._store[k]


challenge_store = ChallengeStore()
