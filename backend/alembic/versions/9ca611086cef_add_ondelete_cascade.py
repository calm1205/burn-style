"""外部キー制約にondelete追加

Revision ID: 9ca611086cef
Revises: 2497e50b8efc
Create Date: 2026-02-26 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9ca611086cef"
down_revision: str | Sequence[str] | None = "2497e50b8efc"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# (table, old_constraint_name, new_constraint_name, local_cols, ref_table, remote_cols)
FK_CHANGES: list[tuple[str, str, str, list[str], str, list[str]]] = [
    ("categories", "categories_user_uuid_fkey", "categories_user_uuid_fkey", ["user_uuid"], "users", ["uuid"]),
    ("expenses", "expenses_user_uuid_fkey", "expenses_user_uuid_fkey", ["user_uuid"], "users", ["uuid"]),
    (
        "webauthn_credentials",
        "webauthn_credentials_user_uuid_fkey",
        "webauthn_credentials_user_uuid_fkey",
        ["user_uuid"],
        "users",
        ["uuid"],
    ),
    (
        "expense_templates",
        "expense_templates_user_uuid_fkey",
        "expense_templates_user_uuid_fkey",
        ["user_uuid"],
        "users",
        ["uuid"],
    ),
    (
        "expense_templates",
        "expense_templates_category_uuid_fkey",
        "expense_templates_category_uuid_fkey",
        ["category_uuid"],
        "categories",
        ["uuid"],
    ),
    (
        "expense_category_association",
        "expense_category_association_expense_uuid_fkey",
        "expense_category_association_expense_uuid_fkey",
        ["expense_uuid"],
        "expenses",
        ["uuid"],
    ),
    (
        "expense_category_association",
        "expense_category_association_category_uuid_fkey",
        "expense_category_association_category_uuid_fkey",
        ["category_uuid"],
        "categories",
        ["uuid"],
    ),
]


def upgrade() -> None:
    """Upgrade schema."""
    for table, old_name, new_name, local_cols, ref_table, remote_cols in FK_CHANGES:
        op.drop_constraint(old_name, table, type_="foreignkey")
        op.create_foreign_key(new_name, table, ref_table, local_cols, remote_cols, ondelete="CASCADE")


def downgrade() -> None:
    """Downgrade schema."""
    for table, old_name, new_name, local_cols, ref_table, remote_cols in FK_CHANGES:
        op.drop_constraint(new_name, table, type_="foreignkey")
        op.create_foreign_key(old_name, table, ref_table, local_cols, remote_cols)
