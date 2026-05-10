"""drop expense_templates

Revision ID: a1b2c3d4e5f6
Revises: 58a540512762
Create Date: 2026-05-10 00:00:00.000000

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | Sequence[str] | None = "58a540512762"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_table("expense_templates")


def downgrade() -> None:
    op.create_table(
        "expense_templates",
        sa.Column("uuid", sa.String(length=32), nullable=False),
        sa.Column("user_uuid", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("category_uuid", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.CheckConstraint("amount > 0", name="check_expense_template_amount_positive"),
        sa.ForeignKeyConstraint(
            ["category_uuid"], ["categories.uuid"], ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_uuid"], ["users.uuid"], ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("uuid"),
    )
