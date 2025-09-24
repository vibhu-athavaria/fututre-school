"""add username and password fields to students

Revision ID: 110b1b4f27a0
Revises: 4eca372c0fb4
Create Date: 2025-09-23 12:29:45.308882

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '110b1b4f27a0'
down_revision = '4eca372c0fb4'
branch_labels = None
depends_on = None


def upgrade():
     # ⚠️ This will delete ALL students!
    op.execute("DELETE FROM students")

    # Now safe to add non-nullable columns
    op.add_column('students', sa.Column('username', sa.String(length=255), nullable=False, unique=True))
    op.add_column('students', sa.Column('password', sa.String(length=255), nullable=False))



def downgrade():
    op.drop_column('students', 'password')
    op.drop_column('students', 'username')