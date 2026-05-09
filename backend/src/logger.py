from __future__ import annotations

import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any

request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)
user_uuid_var: ContextVar[str | None] = ContextVar("user_uuid", default=None)


class JsonFormatter(logging.Formatter):
    """contextvarsのrequest_id/user_uuidを自動付与するJSONフォーマッタ。"""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if request_id := request_id_var.get():
            payload["request_id"] = request_id
        if user_uuid := user_uuid_var.get():
            payload["user_uuid"] = user_uuid
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        payload.update(
            {k: v for k, v in record.__dict__.items() if k not in _RESERVED_KEYS},
        )
        return json.dumps(payload, ensure_ascii=False, default=str)


_RESERVED_KEYS = {
    "args", "asctime", "created", "exc_info", "exc_text", "filename", "funcName",
    "levelname", "levelno", "lineno", "message", "module", "msecs", "msg", "name",
    "pathname", "process", "processName", "relativeCreated", "stack_info", "thread",
    "threadName", "taskName",
}


def configure_logging() -> None:
    """ルートロガーにJsonFormatterをインストール。冪等。"""
    root = logging.getLogger()
    if any(isinstance(h.formatter, JsonFormatter) for h in root.handlers):
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """burnstyle名前空間のロガーを取得。"""
    configure_logging()
    return logging.getLogger(f"burnstyle.{name}")
