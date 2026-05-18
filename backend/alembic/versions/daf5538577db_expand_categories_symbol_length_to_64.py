"""categories.symbol カラムを VARCHAR(8) から VARCHAR(64) に拡張

ZWJ結合絵文字や Variation Selector 付き絵文字を扱えるよう長さを緩和。

Revision ID: daf5538577db
Revises: 4b55d17ee529
Create Date: 2026-05-18 18:24:33.811256

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "daf5538577db"
down_revision: str | Sequence[str] | None = "4b55d17ee529"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "categories",
        "symbol",
        existing_type=sa.String(length=8),
        type_=sa.String(length=64),
        existing_nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "categories",
        "symbol",
        existing_type=sa.String(length=64),
        type_=sa.String(length=8),
        existing_nullable=True,
    )
