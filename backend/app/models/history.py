"""The ticket_history table (KSP-33, HIST spec section 4).

One row per event in a ticket's life: "created" when the ticket is made (HIST-01) and
"status_changed" for every status change (HIST-02). Rows are only ever added. The
application never changes or deletes them (AGENTS.md), so the history can be trusted.
"""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class HistoryRow(Base):
    """One history entry. Written only by TicketService, in the same transaction as the status."""

    __tablename__ = "ticket_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Indexed, since the history is always read for one ticket at a time.
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"), index=True)
    # "created" or "status_changed" (EventType in the schema).
    event_type: Mapped[str]
    # None only for "created", since there is no previous status.
    from_status: Mapped[str | None]
    to_status: Mapped[str]
    # Same fixed UTC text format as tickets.created_at, so sorting as text is sorting by time.
    occurred_at: Mapped[str]
