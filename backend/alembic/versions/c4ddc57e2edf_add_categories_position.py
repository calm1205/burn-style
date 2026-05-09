"""カテゴリに並び順カラムを追加

Revision ID: c4ddc57e2edf
Revises: aec700ae61d2
Create Date: 2026-05-09 22:35:15.130741

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c4ddc57e2edf"
down_revision: str | Sequence[str] | None = "aec700ae61d2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # nullableで追加 → 既存行をユーザーごとにuuid順でposition埋め → NOT NULL化
    op.add_column(
        "categories", sa.Column("position", sa.Integer(), nullable=True),
    )
    op.execute(
        """
        UPDATE categories AS c
        SET position = sub.rn - 1
        FROM (
            SELECT uuid, ROW_NUMBER() OVER (PARTITION BY user_uuid ORDER BY uuid) AS rn
            FROM categories
        ) AS sub
        WHERE c.uuid = sub.uuid
        """,
    )
    op.alter_column("categories", "position", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("categories", "position")
