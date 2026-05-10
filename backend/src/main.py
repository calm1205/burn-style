from __future__ import annotations

import os

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
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
from src.config import get_frontend_origin
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

app.add_middleware(TokenRefreshMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Vercel デプロイ時は vercel.json の headers が CORS を担う。
# ローカル (uvicorn / docker compose) のみ FastAPI 側で CORS を付与する。
if not os.getenv("VERCEL_ENV"):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[get_frontend_origin()],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["X-New-Token", "X-Request-ID"],
        max_age=0,
    )

app.add_middleware(RequestLoggingMiddleware)


@app.options("/{path:path}")
async def options_preflight(path: str) -> Response:
    """CORS preflight 用の catch-all。Vercel では vercel.json が CORS ヘッダを付与する。"""
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
