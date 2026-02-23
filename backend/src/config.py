from __future__ import annotations

import os


def get_jwt_secret_key() -> str:
    """JWT署名用の秘密鍵を取得"""
    value = os.getenv("JWT_SECRET_KEY")
    if value is None:
        raise ValueError("JWT_SECRET_KEY environment variable is not set.")
    return value



def get_webauthn_rp_id() -> str:
    """WebAuthn Relying Party IDを取得"""
    return os.getenv("WEBAUTHN_RP_ID", "localhost")


def get_webauthn_rp_name() -> str:
    """WebAuthn Relying Party名を取得"""
    return os.getenv("WEBAUTHN_RP_NAME", "Finance API")


def get_frontend_origin() -> str:
    """フロントエンドのオリジンを取得"""
    return os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
