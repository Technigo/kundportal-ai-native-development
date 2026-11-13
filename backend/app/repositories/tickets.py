"""Reading and writing tickets (KSP-22, KSP-23). Commit is left to the service."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tickets import TicketRow


class TicketRepository:
    """Ticket rows in the database for one session."""

    def __init__(self, session: Session):
        self.session = session

    def add(self, row: TicketRow) -> TicketRow:
        """Add a new ticket. flush() gives it an id, but nothing is saved until commit."""
        self.session.add(row)
        self.session.flush()
        return row

    def list_newest_first(self) -> list[TicketRow]:
        """All tickets, newest first. id breaks ties when two have the same time (CORE-03, B5)."""
        # created_at is text in a fixed format, so sorting it as text is sorting by time.
        query = select(TicketRow).order_by(TicketRow.created_at.desc(), TicketRow.id.desc())
        return list(self.session.scalars(query))

    def get(self, ticket_id: int) -> TicketRow | None:
        """One ticket by id, or None if there is no such ticket."""
        return self.session.get(TicketRow, ticket_id)
