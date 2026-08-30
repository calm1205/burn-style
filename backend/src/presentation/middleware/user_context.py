from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.logger import user_uuid_var
from src.service.jwt_service import decode_access_token


def _user_uuid_from_authorization(auth_header: str) -> str | None:
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header[len("Bearer "):]
    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    user_uuid = payload.get("sub")
    if not isinstance(user_uuid, str):
        return None

    return user_uuid


class UserContextMiddleware(BaseHTTPMiddleware):
    """JWT sub から user_uuid を解決し、ログ用 ContextVar に設定する。"""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        token = user_uuid_var.set(_user_uuid_from_authorization(request.headers.get("authorization", "")))
        try:
            return await call_next(request)
        finally:
            user_uuid_var.reset(token)
