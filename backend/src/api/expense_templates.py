from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from src.api.deps import get_current_user
from src.model.category import Category
from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.expense_template import ExpenseTemplate
from src.model.user import User
from src.repository.database import get_db
from src.schema.expense_template import (
    BulkRecordRequest,
    BulkRecordResponse,
    ExpenseTemplateCreate,
    ExpenseTemplateResponse,
    ExpenseTemplateUpdate,
)

expense_template_router = APIRouter(prefix="/expense-templates", tags=["expense-templates"])


@expense_template_router.get("")
def list_templates(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ExpenseTemplateResponse]:
    templates = (
        db.query(ExpenseTemplate)
        .options(joinedload(ExpenseTemplate.category))
        .filter(
            ExpenseTemplate.user_uuid == user.uuid,
            ExpenseTemplate.deleted_at.is_(None),
        )
        .all()
    )
    return [ExpenseTemplateResponse.model_validate(t) for t in templates]


@expense_template_router.post("", status_code=status.HTTP_201_CREATED)
def create_template(
    body: ExpenseTemplateCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseTemplateResponse:
    category = db.query(Category).filter(
        Category.uuid == body.category_uuid,
        Category.user_uuid == user.uuid,
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")

    template = ExpenseTemplate(
        user_uuid=user.uuid,
        name=body.name,
        amount=body.amount,
        category_uuid=body.category_uuid,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return ExpenseTemplateResponse.model_validate(template)


@expense_template_router.patch("/{uuid}")
def update_template(
    uuid: str,
    body: ExpenseTemplateUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseTemplateResponse:
    template = db.query(ExpenseTemplate).options(joinedload(ExpenseTemplate.category)).filter(
        ExpenseTemplate.uuid == uuid,
        ExpenseTemplate.user_uuid == user.uuid,
        ExpenseTemplate.deleted_at.is_(None),
    ).first()
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    update_data = body.model_dump(exclude_unset=True)
    if "category_uuid" in update_data:
        category = db.query(Category).filter(
            Category.uuid == update_data["category_uuid"],
            Category.user_uuid == user.uuid,
        ).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")

    for key, value in update_data.items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return ExpenseTemplateResponse.model_validate(template)


@expense_template_router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    uuid: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    template = db.query(ExpenseTemplate).filter(
        ExpenseTemplate.uuid == uuid,
        ExpenseTemplate.user_uuid == user.uuid,
        ExpenseTemplate.deleted_at.is_(None),
    ).first()
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    template.deleted_at = datetime.now(UTC)  # type: ignore[assignment]
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@expense_template_router.post("/bulk-record")
def bulk_record(
    body: BulkRecordRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BulkRecordResponse:
    templates = (
        db.query(ExpenseTemplate)
        .filter(
            ExpenseTemplate.uuid.in_(body.template_uuids),
            ExpenseTemplate.user_uuid == user.uuid,
            ExpenseTemplate.deleted_at.is_(None),
        )
        .all()
    )

    if not templates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid templates found")

    for t in templates:
        expense = Expense(user_uuid=user.uuid, name=t.name, amount=t.amount)
        db.add(expense)
        db.flush()
        association = ExpenseCategoryAssociation(expense_uuid=expense.uuid, category_uuid=t.category_uuid)
        db.add(association)

    db.commit()

    return BulkRecordResponse(created_count=len(templates), message=f"{len(templates)}件の支出を記帳しました")
