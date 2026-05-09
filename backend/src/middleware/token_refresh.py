from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.service.jwt_service import create_access_token, decode_access_token


class TokenRefreshMiddleware(BaseHTTPMiddleware):
    """認証付きリクエストで毎回JWTを再発行しレスポンスヘッダに付与。"""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            return response

        token = auth_header[len("Bearer "):]
        try:
            payload = decode_access_token(token)
        except Exception:
            return response

        user_uuid = payload.get("sub")
        if not isinstance(user_uuid, str):
            return response

        new_token = create_access_token(user_uuid)
        response.headers["X-New-Token"] = new_token

        return response
