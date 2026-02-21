from __future__ import annotations

from datetime import UTC, datetime, timedelta

import jwt

from src.config import get_jwt_secret_key

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15


def create_access_token(user_uuid: str) -> str:
    """JWTアクセストークンを生成"""
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_uuid, "exp": expire}
    return jwt.encode(payload, get_jwt_secret_key(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, object]:
    """JWTアクセストークンを検証・デコード"""
    result: dict[str, object] = jwt.decode(token, get_jwt_secret_key(), algorithms=[ALGORITHM])
    return result
