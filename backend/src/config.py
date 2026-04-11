from __future__ import annotations

import os

_JWT_SECRET_MIN_LENGTH = 32


def get_jwt_secret_key() -> str:
    """Get the JWT signing secret key."""
    value = os.getenv("JWT_SECRET_KEY")
    if value is None:
        raise ValueError("JWT_SECRET_KEY environment variable is not set.")
    if os.getenv("VERCEL_ENV") == "production" and len(value) < _JWT_SECRET_MIN_LENGTH:
        raise ValueError("JWT_SECRET_KEY must be at least 32 characters in production.")
    return value



def get_webauthn_rp_id() -> str:
    """Get the WebAuthn Relying Party ID."""
    return os.getenv("WEBAUTHN_RP_ID", "localhost")


def get_webauthn_rp_name() -> str:
    """Get the WebAuthn Relying Party name."""
    return os.getenv("WEBAUTHN_RP_NAME", "BurnStyle")


def get_frontend_origin() -> str:
    """Get the frontend origin URL."""
    return os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
