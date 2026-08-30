from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.domain.user import User
from src.infrastructure import category_repository
from src.infrastructure.database import get_db
from src.presentation.deps import get_current_user, get_or_404
from src.presentation.schema.category import (
    CategoryCreate,
    CategoryMergeRequest,
    CategoryReorderRequest,
    CategoryResponse,
    CategoryUpdate,
)

category_router = APIRouter(prefix="/categories", tags=["categories"])


@category_router.get("")
def list_categories(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryResponse]:
    categories = category_repository.get_all_categories(db, str(user.uuid))
    return [CategoryResponse.model_validate(c) for c in categories]


@category_router.post("", status_code=status.HTTP_201_CREATED)
def create_category(
    body: CategoryCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryResponse:
    category = category_repository.create_category(db, str(user.uuid), body.name, symbol=body.symbol)
    return CategoryResponse.model_validate(category)


@category_router.patch("/{uuid}")
def update_category(
    uuid: str,
    body: CategoryUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryResponse:
    category = get_or_404(
        category_repository.get_category_by_uuid(db, uuid, str(user.uuid)), "Category not found",
    )

    category_patch = body.model_dump(exclude_unset=True)
    if category_patch:
        category = category_repository.update_category(db, category, category_patch)

    return CategoryResponse.model_validate(category)


@category_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    category = get_or_404(
        category_repository.get_category_by_uuid(db, uuid, str(user.uuid)), "Category not found",
    )

    category_repository.delete_category(db, category)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@category_router.put("/order")
def reorder_categories(
    body: CategoryReorderRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryResponse]:
    try:
        categories = category_repository.reorder_categories(db, str(user.uuid), body.uuids)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e),
        ) from None
    return [CategoryResponse.model_validate(c) for c in categories]


@category_router.post("/{uuid}/merge")
def merge_category(
    uuid: str,
    body: CategoryMergeRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryResponse:
    if uuid == body.target_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and target must differ",
        )

    source = get_or_404(
        category_repository.get_category_by_uuid(db, uuid, str(user.uuid)), "Source category not found",
    )
    target = get_or_404(
        category_repository.get_category_by_uuid(db, body.target_uuid, str(user.uuid)),
        "Target category not found",
    )

    merged = category_repository.merge_categories(db, source, target)
    return CategoryResponse.model_validate(merged)
