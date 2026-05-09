from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.api.deps import get_current_user
from src.model.user import User
from src.repository import expense_template_repository
from src.repository.category_repository import get_category_by_uuid
from src.repository.database import get_db
from src.schema.expense_template import (
    BulkRecordRequest,
    BulkRecordResponse,
    ExpenseTemplateCreate,
    ExpenseTemplateResponse,
    ExpenseTemplateUpdate,
)
from src.service import expense_template_service

expense_template_router = APIRouter(prefix="/expense-templates", tags=["expense-templates"])


def _verify_category(db: Session, category_uuid: str, user_uuid: str) -> None:
    if not get_category_by_uuid(db, category_uuid, user_uuid):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")


@expense_template_router.get("")
def list_templates(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ExpenseTemplateResponse]:
    templates = expense_template_repository.get_all_active(db, str(user.uuid))
    return [ExpenseTemplateResponse.model_validate(t) for t in templates]


@expense_template_router.post("", status_code=status.HTTP_201_CREATED)
def create_template(
    body: ExpenseTemplateCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseTemplateResponse:
    _verify_category(db, body.category_uuid, str(user.uuid))
    template = expense_template_repository.create(
        db,
        user_uuid=str(user.uuid),
        name=body.name,
        amount=body.amount,
        category_uuid=body.category_uuid,
    )
    return ExpenseTemplateResponse.model_validate(template)


@expense_template_router.patch("/{uuid}")
def update_template(
    uuid: str,
    body: ExpenseTemplateUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseTemplateResponse:
    template = expense_template_repository.get_by_uuid(db, uuid, str(user.uuid))
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    update_data = body.model_dump(exclude_unset=True)
    if "category_uuid" in update_data:
        _verify_category(db, update_data["category_uuid"], str(user.uuid))

    template = expense_template_repository.update(db, template, update_data)
    return ExpenseTemplateResponse.model_validate(template)


@expense_template_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    template = expense_template_repository.get_by_uuid(db, uuid, str(user.uuid))
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    expense_template_repository.soft_delete(db, template)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@expense_template_router.post("/bulk-record")
def bulk_record(
    body: BulkRecordRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BulkRecordResponse:
    templates = expense_template_service.bulk_record(db, body.template_uuids, str(user.uuid))
    if not templates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid templates found")
    return BulkRecordResponse(
        created_count=len(templates), message=f"Recorded {len(templates)} expenses",
    )
