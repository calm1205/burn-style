"""カテゴリにsymbolカラム (絵文字) を追加

Revision ID: 30a24e9b8516
Revises: c4ddc57e2edf
Create Date: 2026-05-09 23:42:37.769135

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "30a24e9b8516"
down_revision: str | Sequence[str] | None = "c4ddc57e2edf"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("categories", sa.Column("symbol", sa.String(length=8), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("categories", "symbol")
