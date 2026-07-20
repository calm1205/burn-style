from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.logger import get_logger, request_id_var

logger = get_logger("request")

# ブラウザが自動取得する favicon / apple-touch-icon / robots.txt の 404 ノイズを抑止するパス
_NOISE_PATH_PREFIXES = ("/favicon.ico", "/apple-touch-icon", "/robots.txt")
_HTTP_NOT_FOUND = 404


def _is_static_noise(path: str, status_code: int) -> bool:
    return status_code == _HTTP_NOT_FOUND and path.startswith(_NOISE_PATH_PREFIXES)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """request_idを採番し、開始/終了アクセスログを出力。"""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("x-vercel-id") or str(uuid.uuid4())
        token = request_id_var.set(request_id)
        start = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.exception(
                "request failed",
                extra={"method": request.method, "path": request.url.path, "duration_ms": duration_ms},
            )
            raise
        finally:
            request_id_var.reset(token)

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        log = logger.debug if _is_static_noise(request.url.path, response.status_code) else logger.info
        log(
            "request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        response.headers["X-Request-ID"] = request_id
        return response
