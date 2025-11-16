"""Change grade_level from string to integer

Revision ID: 0a3944adc6cf
Revises: f1bf44d67d1b
Create Date: 2025-11-16 15:39:32.372095

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0a3944adc6cf'
down_revision = 'f1bf44d67d1b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Convert the existing column to INTEGER using CAST
    op.alter_column(
        'assessments',
        'grade_level',
        existing_type=sa.String(),
        type_=sa.Integer(),
        postgresql_using="grade_level::integer"
    )


def downgrade() -> None:
    # Convert back to VARCHAR
    op.alter_column(
        'assessments',
        'grade_level',
        existing_type=sa.Integer(),
        type_=sa.String(),
        postgresql_using="grade_level::text"
    )
