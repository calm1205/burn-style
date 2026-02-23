from __future__ import annotations

from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "Finance API is running"}


@health_router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
