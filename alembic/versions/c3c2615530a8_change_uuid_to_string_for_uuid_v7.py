"""change uuid to string for uuid v7

Revision ID: c3c2615530a8
Revises: 884eca252e69
Create Date: 2025-12-08 13:40:32.680865

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c3c2615530a8'
down_revision: Union[str, Sequence[str], None] = '884eca252e69'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # UUID型からString型に変更
    # 既存のUUIDデータをハイフンなしの文字列に変換
    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN uuid TYPE VARCHAR(32) 
        USING REPLACE(uuid::text, '-', '')
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # String型からUUID型に戻す
    # ハイフンなしの文字列をUUID形式に変換
    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN uuid TYPE UUID 
        USING (
            SUBSTRING(uuid, 1, 8) || '-' ||
            SUBSTRING(uuid, 9, 4) || '-' ||
            SUBSTRING(uuid, 13, 4) || '-' ||
            SUBSTRING(uuid, 17, 4) || '-' ||
            SUBSTRING(uuid, 21, 12)
        )::UUID
    """)

