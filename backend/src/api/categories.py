from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository.category_repository import (
    create_category,
    delete_category,
    get_all_categories,
    get_category_by_uuid,
    merge_categories,
    update_category,
)
from src.repository.database import get_db
from src.schema.category import (
    CategoryCreate,
    CategoryMergeRequest,
    CategoryResponse,
    CategoryUpdate,
)

category_router = APIRouter(prefix="/categories", tags=["categories"])


@category_router.get("")
def get_categories(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryResponse]:
    categories = get_all_categories(db, str(user.uuid))
    return [CategoryResponse.model_validate(c) for c in categories]


@category_router.post("", status_code=status.HTTP_201_CREATED)
def post_category(
    body: CategoryCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryResponse:
    category = create_category(db, str(user.uuid), body.name)
    return CategoryResponse.model_validate(category)


@category_router.patch("/{uuid}")
def patch_category(
    uuid: str,
    body: CategoryUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryResponse:
    category = get_category_by_uuid(db, uuid, str(user.uuid))
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = body.model_dump(exclude_unset=True)
    if "name" in update_data:
        category = update_category(db, category, update_data["name"])

    return CategoryResponse.model_validate(category)


@category_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_endpoint(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    category = get_category_by_uuid(db, uuid, str(user.uuid))
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    delete_category(db, category)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@category_router.post("/{uuid}/merge")
def post_category_merge(
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

    source = get_category_by_uuid(db, uuid, str(user.uuid))
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source category not found")

    target = get_category_by_uuid(db, body.target_uuid, str(user.uuid))
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target category not found")

    merged = merge_categories(db, source, target)
    return CategoryResponse.model_validate(merged)
