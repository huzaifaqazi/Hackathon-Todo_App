"""Add conversation and message models for chatbot feature

Revision ID: 001_add_conversation_and_message_models
Revises:
Create Date: 2026-02-01 14:30:00.000000

"""
from typing import Sequence, Union
import uuid
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '001_add_conversation_and_message_models'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create conversation table
    op.create_table('conversation',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create message table
    op.create_table('message',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.Enum('user', 'assistant', 'system', name='roletype'), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('tool_calls', sa.String(), nullable=True),
        sa.Column('tool_responses', sa.String(), nullable=True),
        sa.Column('message_type', sa.Enum('text', 'tool_result', 'feedback', name='messagetype'), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create tool_execution table
    op.create_table('tool_execution',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('message_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tool_name', sa.String(), nullable=False),
        sa.Column('arguments', sa.String(), nullable=False),
        sa.Column('result', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('success', 'error', 'pending', name='toolexecutionstatus'), nullable=False),
        sa.Column('executed_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['message_id'], ['message.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop tool_execution table
    op.drop_table('tool_execution')

    # Drop message table
    op.drop_table('message')

    # Drop conversation table
    op.drop_table('conversation')

    # Drop enums
    op.execute("DROP TYPE IF EXISTS roletype;")
    op.execute("DROP TYPE IF EXISTS messagetype;")
    op.execute("DROP TYPE IF EXISTS toolexecutionstatus;")