from __future__ import annotations

import time
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.logger import get_logger
from src.repository.database import get_db

health_router = APIRouter()
logger = get_logger(__name__)


@health_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "BurnStyle API is running"}


@health_router.get("/health")
def health_check(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    """DB疎通確認。cold start / Neon wake-up観測のため処理時間をログ出力。"""
    started = time.perf_counter()
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        elapsed_ms = (time.perf_counter() - started) * 1000
        logger.warning(
            "health check db failed",
            extra={
                "event": "health_check_db_failed",
                "elapsed_ms": round(elapsed_ms, 1),
                "exc_type": type(e).__name__,
                "exc": str(e),
            },
        )
        raise
    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info(
        "health check ok",
        extra={
            "event": "health_check_ok",
            "elapsed_ms": round(elapsed_ms, 1),
        },
    )
    return {"status": "healthy"}
