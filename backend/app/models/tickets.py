"""The tickets table (KSP-22, CORE section 3).

Column names are the same as the field names in the API, so that a row and the
Ticket answer can be compared directly. The core and the history (HIST) build on this
table, so changes to it are agreed with the team first (AGENTS.md).
"""

from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class TicketRow(Base):
    """One ticket. Status is only changed by TicketService (AGENTS.md)."""

    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Stored already trimmed (B10, B12), so the saved text is the text that was counted.
    title: Mapped[str]
    description: Mapped[str]
    # Codes as text, e.g. "billing". The allowed values are checked by the schema (B2, B3).
    category: Mapped[str]
    priority: Mapped[str]
    status: Mapped[str]
    # Text in the fixed UTC format with microseconds, so sorting as text is correct
    # (API conventions section 3). SQLite has no date type of its own.
    created_at: Mapped[str]
