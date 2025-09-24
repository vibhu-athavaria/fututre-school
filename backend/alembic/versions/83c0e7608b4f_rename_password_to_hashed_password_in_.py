"""rename password to hashed_password in students

Revision ID: 83c0e7608b4f
Revises: 110b1b4f27a0
Create Date: 2025-09-23 14:01:25.169260

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '83c0e7608b4f'
down_revision = '110b1b4f27a0'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "students",
        "password",
        new_column_name="hashed_password"
    )


def downgrade():
    op.alter_column(
        "students",
        "hashed_password",
        new_column_name="password"
    )
