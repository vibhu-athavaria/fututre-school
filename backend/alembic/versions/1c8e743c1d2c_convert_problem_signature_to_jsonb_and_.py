"""convert problem_signature to jsonb and add index

Revision ID: 1c8e743c1d2c
Revises: 496b9fc0dfd9
Create Date: 2026-01-28 15:34:21.683940

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '1c8e743c1d2c'
down_revision = '496b9fc0dfd9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Convert json → jsonb safely
    op.alter_column(
        "question_bank",
        "problem_signature",
        type_=postgresql.JSONB(),
        postgresql_using="problem_signature::jsonb",
        nullable=False,
    )

    # Add GIN index for equality + performance
    op.create_index(
        "ix_question_bank_problem_signature",
        "question_bank",
        ["problem_signature"],
        postgresql_using="gin",
    )


def downgrade():
    op.drop_index(
        "ix_question_bank_problem_signature",
        table_name="question_bank",
    )

    op.alter_column(
        "question_bank",
        "problem_signature",
        type_=postgresql.JSON(),
        postgresql_using="problem_signature::json",
        nullable=False,
    )
