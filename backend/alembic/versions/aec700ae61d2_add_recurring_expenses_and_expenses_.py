"""recurring_expenses追加 + expenses.recurring_expense_uuid追加

Revision ID: aec700ae61d2
Revises: 9ca611086cef
Create Date: 2026-05-09 20:47:00.225698

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "aec700ae61d2"
down_revision: str | Sequence[str] | None = "9ca611086cef"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


FK_NAME = "expenses_recurring_expense_uuid_fkey"


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "recurring_expenses",
        sa.Column("uuid", sa.String(length=32), nullable=False),
        sa.Column("user_uuid", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("category_uuid", sa.String(length=32), nullable=False),
        sa.Column(
            "interval_unit",
            sa.Enum("WEEK", "MONTH", name="interval_unit"),
            nullable=False,
        ),
        sa.Column("interval_count", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.CheckConstraint("amount > 0", name="check_recurring_expense_amount_positive"),
        sa.CheckConstraint(
            "interval_count > 0", name="check_recurring_expense_interval_count_positive",
        ),
        sa.ForeignKeyConstraint(["category_uuid"], ["categories.uuid"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_uuid"], ["users.uuid"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("uuid"),
    )
    op.add_column(
        "expenses",
        sa.Column("recurring_expense_uuid", sa.String(length=32), nullable=True),
    )
    op.create_foreign_key(
        FK_NAME,
        "expenses",
        "recurring_expenses",
        ["recurring_expense_uuid"],
        ["uuid"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(FK_NAME, "expenses", type_="foreignkey")
    op.drop_column("expenses", "recurring_expense_uuid")
    op.drop_table("recurring_expenses")
    op.execute("DROP TYPE IF EXISTS interval_unit")
