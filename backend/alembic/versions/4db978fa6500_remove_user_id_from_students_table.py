"""remove user_id from students table

Revision ID: 4db978fa6500
Revises: 83c0e7608b4f
Create Date: 2025-09-23 16:34:13.284189

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4db978fa6500'
down_revision = '83c0e7608b4f'
branch_labels = None
depends_on = None


def upgrade():
    # drop the column
    op.drop_column("students", "user_id")


def downgrade():
    # restore the column if you rollback
    op.add_column("students", sa.Column("user_id", sa.Integer(), nullable=True))
    # if it was a foreign key, you’d also need to re-add the constraint
    # op.create_foreign_key("fk_students_user_id_users", "students", "users", ["user_id"], ["id"])