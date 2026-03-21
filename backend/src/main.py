from __future__ import annotations

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.api import (
    auth_router,
    category_router,
    expense_router,
    expense_template_router,
    health_router,
    user_router,
)
from src.config import get_frontend_origin
from src.middleware import TokenRefreshMiddleware


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """セキュリティヘッダーを付与するミドルウェア"""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response


app = FastAPI(title="BurnStyle API", version="1.0.0")

# ミドルウェア(後から追加したものが外側になる)
# リクエスト順: CORS → SecurityHeaders → TokenRefresh → ルーター
app.add_middleware(TokenRefreshMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_frontend_origin()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["X-New-Token"],
)

# ルーターを登録
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(category_router)
app.include_router(expense_router)
app.include_router(expense_template_router)
app.include_router(user_router)
