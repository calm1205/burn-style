"""drop users table

Revision ID: 745592fe5c87
Revises: 318327bd505d
Create Date: 2026-02-08

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "745592fe5c87"
down_revision: str | Sequence[str] = "318327bd505d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint("expenses_user_uuid_fkey", "expenses", type_="foreignkey")
    op.drop_column("expenses", "user_uuid")
    op.drop_constraint("categories_user_uuid_fkey", "categories", type_="foreignkey")
    op.drop_column("categories", "user_uuid")
    op.drop_table("users")


def downgrade() -> None:
    """Downgrade schema."""
    op.create_table("users",
        sa.Column("uuid", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("uuid"),
    )
    op.add_column("categories", sa.Column("user_uuid", sa.String(length=32), nullable=False))
    op.create_foreign_key("categories_user_uuid_fkey", "categories", "users", ["user_uuid"], ["uuid"])
    op.add_column("expenses", sa.Column("user_uuid", sa.String(length=32), nullable=False))
    op.create_foreign_key("expenses_user_uuid_fkey", "expenses", "users", ["user_uuid"], ["uuid"])
