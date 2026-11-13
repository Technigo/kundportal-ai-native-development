"""Writing and reading history entries (KSP-33, KSP-35). Commit is left to the service.

There is deliberately no update or delete: history entries are never changed (AGENTS.md).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.history import HistoryRow


class HistoryRepository:
    """History rows in the database for one session."""

    def __init__(self, session: Session):
        self.session = session

    def add(self, row: HistoryRow) -> HistoryRow:
        """Add an entry. Nothing is saved until the service commits."""
        self.session.add(row)
        self.session.flush()
        return row

    def list_for_ticket(self, ticket_id: int) -> list[HistoryRow]:
        """One ticket's entries, oldest first (HIST-03). id breaks ties at the same time (HIST-11)."""
        # occurred_at is text in a fixed format, so sorting it as text is sorting by time.
        query = (
            select(HistoryRow)
            .where(HistoryRow.ticket_id == ticket_id)
            .order_by(HistoryRow.occurred_at, HistoryRow.id)
        )
        return list(self.session.scalars(query))
