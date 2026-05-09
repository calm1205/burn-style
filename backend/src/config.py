from __future__ import annotations

import os

_JWT_SECRET_MIN_LENGTH = 32


def get_jwt_secret_key() -> str:
    """JWT署名用シークレットキーを取得。"""
    value = os.getenv("JWT_SECRET_KEY")
    if value is None:
        raise ValueError("JWT_SECRET_KEY environment variable is not set.")
    if os.getenv("VERCEL_ENV") == "production" and len(value) < _JWT_SECRET_MIN_LENGTH:
        raise ValueError("JWT_SECRET_KEY must be at least 32 characters in production.")
    return value



def get_webauthn_rp_id() -> str:
    """WebAuthn Relying Party IDを取得。"""
    return os.getenv("WEBAUTHN_RP_ID", "localhost")


def get_webauthn_rp_name() -> str:
    """WebAuthn Relying Party名を取得。"""
    return os.getenv("WEBAUTHN_RP_NAME", "BurnStyle")


def get_frontend_origin() -> str:
    """フロントエンドのoriginURLを取得。"""
    return os.getenv("FRONTEND_ORIGIN", "http://localhost:15173")


def get_cron_secret() -> str:
    """cron用のBearerトークンを取得 (/cronエンドポイント認証で必須)。"""
    value = os.getenv("CRON_SECRET")
    if value is None:
        raise ValueError("CRON_SECRET environment variable is not set.")
    return value
