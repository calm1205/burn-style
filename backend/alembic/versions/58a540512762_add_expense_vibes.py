"""支出にVIBE (感情) 3軸カラムを追加

Revision ID: 58a540512762
Revises: 30a24e9b8516
Create Date: 2026-05-10 10:09:44.123497

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "58a540512762"
down_revision: str | Sequence[str] | None = "30a24e9b8516"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    social = sa.Enum("SOLO", "WITH_SOMEONE", name="vibe_social")
    planning = sa.Enum("ROUTINE", "SPONTANEOUS", name="vibe_planning")
    necessity = sa.Enum("NEEDED", "WANTED", name="vibe_necessity")
    social.create(op.get_bind(), checkfirst=True)
    planning.create(op.get_bind(), checkfirst=True)
    necessity.create(op.get_bind(), checkfirst=True)
    op.add_column("expenses", sa.Column("vibe_social", social, nullable=True))
    op.add_column("expenses", sa.Column("vibe_planning", planning, nullable=True))
    op.add_column("expenses", sa.Column("vibe_necessity", necessity, nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("expenses", "vibe_necessity")
    op.drop_column("expenses", "vibe_planning")
    op.drop_column("expenses", "vibe_social")
    op.execute("DROP TYPE IF EXISTS vibe_necessity")
    op.execute("DROP TYPE IF EXISTS vibe_planning")
    op.execute("DROP TYPE IF EXISTS vibe_social")
