"""merge heads

Revision ID: f606f7d0aaa2
Revises: 792e00593eac, e4c91a0f1d23
Create Date: 2026-01-19 17:43:03.602726

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f606f7d0aaa2'
down_revision = ('792e00593eac', 'e4c91a0f1d23')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
