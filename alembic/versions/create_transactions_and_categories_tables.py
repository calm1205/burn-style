"""create transactions and categories tables

Revision ID: a1b2c3d4e5f6
Revises: c3c2615530a8
Create Date: 2025-12-08 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "c3c2615530a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # categoriesテーブルを作成
    op.create_table(
        "categories",
        sa.Column("uuid", sa.String(32), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("uuid"),
    )
    
    # transactionsテーブルを作成
    op.create_table(
        "transactions",
        sa.Column("uuid", sa.String(32), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("uuid"),
    )
    
    # 多対多の関係を表す中間テーブルを作成
    op.create_table(
        "transaction_category_association",
        sa.Column("transaction_uuid", sa.String(32), nullable=False),
        sa.Column("category_uuid", sa.String(32), nullable=False),
        sa.ForeignKeyConstraint(["transaction_uuid"], ["transactions.uuid"]),
        sa.ForeignKeyConstraint(["category_uuid"], ["categories.uuid"]),
        sa.PrimaryKeyConstraint("transaction_uuid", "category_uuid"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("transaction_category_association")
    op.drop_table("transactions")
    op.drop_table("categories")

