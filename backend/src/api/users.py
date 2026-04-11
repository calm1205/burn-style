from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from src.api.deps import get_current_user
from src.model.category import Category
from src.model.expense import Expense
from src.model.expense_category_association import ExpenseCategoryAssociation
from src.model.expense_template import ExpenseTemplate
from src.model.user import User
from src.repository.category_repository import get_all_categories
from src.repository.database import get_db
from src.repository.expense_repository import get_all_expenses
from src.repository.user_repository import delete_user, update_user
from src.schema.auth import UserResponse, UserUpdateRequest
from src.schema.category import CategoryResponse
from src.schema.expense import ExpenseResponse
from src.schema.user import ExportExpenseTemplateResponse, UserExportResponse, UserImportRequest, UserImportResponse

user_router = APIRouter(tags=["users"])


@user_router.get("/me")
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    """Return current user info."""
    return UserResponse.model_validate(current_user)


@user_router.patch("/me")
def update_me(
    body: UserUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Update current user info."""
    updated = update_user(db, current_user, body.name)
    return UserResponse.model_validate(updated)


@user_router.get("/me/export")
def export_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserExportResponse:
    """Export all data of the current user."""
    user_uuid = str(current_user.uuid)
    categories = get_all_categories(db, user_uuid)
    expenses = get_all_expenses(db, user_uuid, include_deleted=True)
    templates = (
        db.query(ExpenseTemplate)
        .options(joinedload(ExpenseTemplate.category))
        .filter(ExpenseTemplate.user_uuid == user_uuid)
        .all()
    )
    return UserExportResponse(
        name=str(current_user.name),
        categories=[CategoryResponse.model_validate(c) for c in categories],
        expenses=[ExpenseResponse.model_validate(e) for e in expenses],
        expense_templates=[ExportExpenseTemplateResponse.model_validate(t) for t in templates],
    )


@user_router.post("/me/import")
def import_me(
    body: UserImportRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserImportResponse:
    """Import exported JSON data."""
    user_uuid = str(current_user.uuid)

    # Delete existing data (ordered by FK constraints)
    db.query(ExpenseCategoryAssociation).filter(
        ExpenseCategoryAssociation.expense_uuid.in_(
            db.query(Expense.uuid).filter(Expense.user_uuid == user_uuid),
        ),
    ).delete(synchronize_session=False)
    db.query(ExpenseTemplate).filter(ExpenseTemplate.user_uuid == user_uuid).delete(synchronize_session=False)
    db.query(Expense).filter(Expense.user_uuid == user_uuid).delete(synchronize_session=False)
    db.query(Category).filter(Category.user_uuid == user_uuid).delete(synchronize_session=False)

    # Import categories (old UUID -> new UUID mapping)
    category_uuid_map: dict[str, str] = {}
    for cat in body.categories:
        new_category = Category(user_uuid=user_uuid, name=cat.name)
        db.add(new_category)
        db.flush()
        category_uuid_map[cat.uuid] = str(new_category.uuid)

    # Import expenses
    for exp in body.expenses:
        expense = Expense(
            user_uuid=user_uuid,
            name=exp.name,
            amount=exp.amount,
            expensed_at=exp.expensed_at,
            created_at=exp.created_at,
            updated_at=exp.updated_at,
            deleted_at=exp.deleted_at,
        )
        db.add(expense)
        db.flush()

        for cat in exp.categories:
            new_category_uuid = category_uuid_map.get(cat.uuid)
            if new_category_uuid:
                db.add(ExpenseCategoryAssociation(expense_uuid=expense.uuid, category_uuid=new_category_uuid))

    # Import expense templates
    for tmpl in body.expense_templates:
        new_category_uuid = category_uuid_map.get(tmpl.category.uuid)
        if new_category_uuid:
            db.add(ExpenseTemplate(
                user_uuid=user_uuid,
                name=tmpl.name,
                amount=tmpl.amount,
                category_uuid=new_category_uuid,
                created_at=tmpl.created_at,
                updated_at=tmpl.updated_at,
                deleted_at=tmpl.deleted_at,
            ))

    db.commit()

    return UserImportResponse(
        categories_count=len(body.categories),
        expenses_count=len(body.expenses),
        expense_templates_count=len(body.expense_templates),
        message=f"Imported {len(body.categories)} categories, {len(body.expenses)} expenses,"
        f" and {len(body.expense_templates)} templates",
    )


@user_router.delete("/me", status_code=204)
def delete_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete the current user."""
    delete_user(db, current_user)
