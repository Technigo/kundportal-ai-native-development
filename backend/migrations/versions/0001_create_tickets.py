from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


revision = "0001_create_tickets"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("customer_id", sa.String(length=100), nullable=False),
        sa.Column("customer_name", sa.String(length=200), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.String(length=16), nullable=False),
        sa.Column(
            "status",
            sa.String(length=32),
            server_default="new",
            nullable=False,
        ),
        sa.Column("created_at", mysql.DATETIME(fsp=6), nullable=False),
        sa.CheckConstraint(
            "category IN ('billing', 'technical_support', 'other')",
            name="ck_tickets_category",
        ),
        sa.CheckConstraint(
            "priority IN ('low', 'normal', 'high')",
            name="ck_tickets_priority",
        ),
        sa.CheckConstraint(
            "status IN ('new', 'in_progress', 'waiting_for_customer', 'closed')",
            name="ck_tickets_status",
        ),
        sa.PrimaryKeyConstraint("id"),
        mysql_charset="utf8mb4",
    )


def downgrade() -> None:
    op.drop_table("tickets")
