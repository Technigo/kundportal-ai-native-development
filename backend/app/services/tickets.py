"""TicketService: the rules for tickets and where each transaction starts and ends.

Creating a ticket (KSP-22) sets status "new" (CORE-01) and writes the history entry
"created" (HIST-01) in the same transaction (KSP-34). Changing the status writes the new
status and a "status_changed" entry together, with one commit (HIST-02, ADR-001: the
transaction lives here in the service). Status is only ever written here (AGENTS.md).
Listing and reading tickets (KSP-23) and the history (KSP-35) only read, so they need no commit.
"""

# Annotations are not evaluated at class creation, since list() is also a method name here.
from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.history import HistoryRow
from app.models.tickets import TicketRow
from app.repositories.history import HistoryRepository
from app.repositories.tickets import TicketRepository
from app.schemas.tickets import EventType, Status, TicketCreate

# API conventions section 3: UTC, always with microseconds, e.g. 2026-10-25T09:00:00.000000Z.
TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"


class TicketNotFound(Exception):
    """No ticket with that id. The router turns it into 404, so the service knows no HTTP."""


class SameStatus(Exception):
    """The ticket already has that status (service part of HIST-07).

    Rejected here so that an "x -> x" entry is never written: history entries are never
    changed or deleted, so a wrong one would stay forever. The router turns it into 409.
    """


class StatusNotSaved(Exception):
    """The status change could not be saved because of a database error (HIST-09).

    Raised after the rollback, so nothing of the change is left. The router turns it into
    503, the same code /health uses when the database cannot be reached (ADR-001).
    """


def utc_now() -> datetime:
    """The real clock. Tests can pass another one (architecture: replaceable clock)."""
    return datetime.now(UTC)


class TicketService:
    """Creates and reads tickets. One service per request, with that request's session."""

    def __init__(self, session: Session, clock: Callable[[], datetime] = utc_now):
        self.session = session
        self.tickets = TicketRepository(session)
        self.history = HistoryRepository(session)
        self.clock = clock

    def _now(self) -> str:
        """The current time in the fixed UTC text format."""
        return self.clock().strftime(TIMESTAMP_FORMAT)

    def create(self, data: TicketCreate) -> TicketRow:
        """Save a new ticket with status "new" and its "created" entry, in one transaction.

        The input is already validated and trimmed, so a 422 never gets here (HIST-10).
        """
        # One reading of the clock, so the entry has exactly the ticket's created_at (HIST-01).
        now = self._now()
        row = TicketRow(
            title=data.title,
            description=data.description,
            category=data.category,
            priority=data.priority,
            # CORE-01: the server always sets the first status, the client cannot (CORE-09).
            status=Status.NEW,
            created_at=now,
        )
        # add() flushes, so the ticket has an id that the entry can point to.
        self.tickets.add(row)
        self.history.add(
            HistoryRow(
                ticket_id=row.id,
                event_type=EventType.CREATED,
                from_status=None,
                to_status=Status.NEW,
                occurred_at=now,
            )
        )
        # One commit for ticket and entry together: both are saved, or neither (ADR-001).
        self.session.commit()
        return row

    def change_status(self, ticket_id: int, new_status: Status) -> TicketRow:
        """Change the status and write a "status_changed" entry, in one transaction (HIST-02).

        Raises TicketNotFound for an unknown id and SameStatus if nothing would change.
        """
        row = self.get(ticket_id)
        if row.status == new_status:
            raise SameStatus(ticket_id)
        previous = row.status
        try:
            row.status = new_status
            self.history.add(
                HistoryRow(
                    ticket_id=row.id,
                    event_type=EventType.STATUS_CHANGED,
                    from_status=previous,
                    to_status=new_status,
                    occurred_at=self._now(),
                )
            )
            # The one commit for status and entry. Nothing is saved before it (ADR-001).
            self.session.commit()
        except SQLAlchemyError as exc:
            # HIST-09 (a failed history entry rolls back the status change): roll back so the
            # session can be used again (ADR-001). Only database errors become StatusNotSaved,
            # which the router answers with 503. The cause is kept as __cause__ (from exc) but
            # is not logged.
            self.session.rollback()
            raise StatusNotSaved(ticket_id) from exc
        except Exception:
            # HIST-09: any other error is rolled back too, so the session is never left broken,
            # but propagates unchanged and gives 500, so a bug is not hidden behind "try again".
            self.session.rollback()
            raise
        # Load the saved values, so the row can still be read after the session is closed.
        self.session.refresh(row)
        return row

    def list(self) -> list[TicketRow]:
        """All tickets, newest first (CORE-03), or an empty list (CORE-15)."""
        return self.tickets.list_newest_first()

    def get(self, ticket_id: int) -> TicketRow:
        """One ticket (CORE-04). Raises TicketNotFound for an unknown id (CORE-10)."""
        row = self.tickets.get(ticket_id)
        if row is None:
            raise TicketNotFound(ticket_id)
        return row

    def get_history(self, ticket_id: int) -> list[HistoryRow]:
        """The ticket's history, oldest first (HIST-03, HIST-11).

        Checks first that the ticket exists, so an unknown id gives TicketNotFound (HIST-08)
        and never an empty list. A ticket that exists always has its "created" entry (HIST-12).
        """
        self.get(ticket_id)
        return self.history.list_for_ticket(ticket_id)
