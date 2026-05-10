from __future__ import annotations

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.api import (
    auth_router,
    category_router,
    cron_router,
    expense_router,
    health_router,
    recurring_expense_router,
    user_router,
)
from src.logger import configure_logging
from src.middleware import RequestLoggingMiddleware, TokenRefreshMiddleware

configure_logging()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """セキュリティヘッダを付与するミドルウェア。"""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response


app = FastAPI(title="BurnStyle API", version="1.0.0")

# CORS は vercel.json の headers で edge 層が一括付与する。
# OPTIONS preflight だけは 2xx で応答する必要があるので、catch-all を定義。
app.add_middleware(TokenRefreshMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)


@app.options("/{path:path}")
async def options_preflight(path: str) -> Response:
    """CORS preflight 用の catch-all。レスポンス 204 + Vercel が CORS ヘッダを付与。"""
    del path
    return Response(status_code=204)


# Register routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(category_router)
app.include_router(expense_router)
app.include_router(recurring_expense_router)
app.include_router(cron_router)
app.include_router(user_router)
