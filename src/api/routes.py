from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def root() -> dict[str, str]:
    return {"message": "Finance API is running"}


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
