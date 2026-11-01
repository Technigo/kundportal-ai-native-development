"""History of a ticket: the "created" entry and status changes written with the status.

Covers HIST-01 (a new ticket has exactly one "created" entry), HIST-02 (a status change
saves the new status and a "status_changed" entry together), HIST-10 (a rejected ticket
leaves no history), the service part of HIST-07 (the same status is rejected, so no
"x -> x" entry is ever written) and the invariant from ADR-001 (the latest entry's
to_status always equals the ticket's status). Part of KSP-39 (Azalea's HIST tests),
written before the code for KSP-33 (history table) and KSP-34 (TicketService writes
history in the same transaction).

PATCH /tickets/{id}/status does not exist yet (KSP-24), so status changes go through
TicketService directly against a real SQLite file. The same requirements are tested
through the API when PATCH is built. The tests read the file with sqlite3, so that they
see what was really saved.
Test proposals: docs/ai/testforslag-v1.md, reviewed by Azalea 2026-10-28.
"""

import re
import sqlite3
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.tickets import Status, TicketCreate
from app.services import tickets as ticket_service
from app.services.tickets import TicketService

# API conventions section 3: UTC, always with microseconds.
TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$")

# A valid body (made-up data).
VALID_TICKET = {
    "title": "Fakturan har fel belopp",
    "description": "Kunden har fått dubbel debitering för oktober.",
    "category": "billing",
    "priority": "high",
}


def create(client, **changes):
    """Create a ticket through the API and return the answer."""
    response = client.post("/tickets", json={**VALID_TICKET, **changes})
    assert response.status_code == 201, response.text
    return response.json()


def connect(database_url):
    """A new sqlite3 connection to the test file, outside the app's session."""
    connection = sqlite3.connect(database_url.removeprefix("sqlite:///"))
    connection.row_factory = sqlite3.Row
    return connection


def saved_history(database_url, ticket_id=None):
    """History rows from the file, oldest first (occurred_at, then id, as HIST-03 and HIST-11)."""
    query = "SELECT * FROM ticket_history"
    args = ()
    if ticket_id is not None:
        query += " WHERE ticket_id = ?"
        args = (ticket_id,)
    with connect(database_url) as connection:
        rows = connection.execute(query + " ORDER BY occurred_at, id", args)
        return [dict(row) for row in rows]


def saved_status(database_url, ticket_id):
    """The ticket's status as it is in the file."""
    with connect(database_url) as connection:
        return connection.execute("SELECT status FROM tickets WHERE id = ?", (ticket_id,)).fetchone()[0]


def assert_invariant(database_url, ticket_id):
    """ADR-001 invariant: the latest history entry's to_status equals the ticket's status."""
    history = saved_history(database_url, ticket_id)
    assert history, "the ticket has no history at all"
    assert history[-1]["to_status"] == saved_status(database_url, ticket_id)


def change_status(client, ticket_id, new_status, clock=None):
    """Change the status through TicketService in its own session, as one request would."""
    with client.app.state.session_factory() as session:
        service = TicketService(session, clock=clock) if clock else TicketService(session)
        return service.change_status(ticket_id, new_status)


# --- The "created" entry (HIST-01) ---


def test_hist01_created_ticket_has_one_created_entry(client, database_url):
    """HIST-01: a new ticket has status "new" and exactly one "created" entry (null -> new)."""
    # Catches: the history insert removed from create() (mutation in HIST spec section 10).
    ticket = create(client)

    [entry] = saved_history(database_url, ticket["id"])
    assert entry["event_type"] == "created"
    assert entry["from_status"] is None
    assert entry["to_status"] == "new"
    assert TIMESTAMP.match(entry["occurred_at"])
    assert_invariant(database_url, ticket["id"])


def test_hist01_created_entry_time_equals_ticket_created_at(client, database_url):
    """HIST-01: the "created" entry has the same time as the ticket's created_at."""
    # Catches: the entry taking its own time from a second call to the clock.
    ticket = create(client)

    [entry] = saved_history(database_url, ticket["id"])
    assert entry["occurred_at"] == ticket["created_at"]
    assert_invariant(database_url, ticket["id"])


def test_hist01_each_ticket_gets_its_own_created_entry(client, database_url):
    """HIST-01: two tickets get one "created" entry each, with the right ticket_id."""
    # Catches: ticket_id set wrongly, e.g. always to the first ticket.
    first = create(client, title="Första")
    second = create(client, title="Andra")

    history = saved_history(database_url)
    assert sorted(entry["ticket_id"] for entry in history) == sorted([first["id"], second["id"]])
    assert all(entry["event_type"] == "created" for entry in history)
    assert_invariant(database_url, first["id"])
    assert_invariant(database_url, second["id"])


# --- A rejected ticket leaves no history (HIST-10) ---


@pytest.mark.parametrize(
    "changes",
    [{"title": ""}, {"title": 5}],
    ids=["empty_title_field_error", "title_is_number_wrong_type"],
)
def test_hist10_rejected_ticket_has_no_history(client, database_url, changes):
    """HIST-10: a ticket that cannot be created leaves no history entry.

    That no *ticket* is saved is tested in CORE-06 to CORE-09 (test_create_ticket.py).
    """
    # Catches: the history entry written before validation, or in its own transaction.
    response = client.post("/tickets", json={**VALID_TICKET, **changes})

    assert response.status_code == 422
    assert saved_history(database_url) == []


# --- A status change writes status and entry together (HIST-02) ---


def test_hist02_change_status_writes_status_and_entry(client, database_url):
    """HIST-02: new -> in_progress gives the new status and a "status_changed" entry."""
    # Catches: the history insert removed from change_status() (mutation in section 10).
    ticket = create(client)

    row = change_status(client, ticket["id"], Status.IN_PROGRESS)

    assert row.status == "in_progress"
    assert saved_status(database_url, ticket["id"]) == "in_progress"
    history = saved_history(database_url, ticket["id"])
    assert [(e["event_type"], e["from_status"], e["to_status"]) for e in history] == [
        ("created", None, "new"),
        ("status_changed", "new", "in_progress"),
    ]
    assert_invariant(database_url, ticket["id"])


def test_hist02_change_status_is_saved_after_commit(client, database_url):
    """HIST-02: the change is committed, so a new app on the same file sees it.

    A new app means a new engine and a new session, so nothing can come from a session
    that was never committed.
    """
    # Catches: commit() removed from change_status() (only flush), so nothing is saved.
    ticket = create(client)
    change_status(client, ticket["id"], Status.IN_PROGRESS)

    with TestClient(create_app(database_url)) as fresh:
        assert fresh.get(f"/tickets/{ticket['id']}").json()["status"] == "in_progress"
    assert len(saved_history(database_url, ticket["id"])) == 2
    assert_invariant(database_url, ticket["id"])


def test_hist02_from_status_is_previous_status(client, database_url):
    """HIST-02: after in_progress, a change to waiting_on_customer has from_status in_progress."""
    # Catches: from_status set to "new" or to the new status instead of the previous one.
    ticket = create(client)
    change_status(client, ticket["id"], Status.IN_PROGRESS)
    change_status(client, ticket["id"], Status.WAITING_ON_CUSTOMER)

    latest = saved_history(database_url, ticket["id"])[-1]
    assert (latest["from_status"], latest["to_status"]) == ("in_progress", "waiting_on_customer")
    assert_invariant(database_url, ticket["id"])


# --- The invariant from ADR-001 over a chain of changes ---


def ticking_clock(start=datetime(2026, 10, 28, 9, 0, 0, tzinfo=UTC)):
    """A clock that moves one second per call, so "latest entry" is never a tie."""
    moments = iter(start + timedelta(seconds=n) for n in range(1000))
    return lambda: next(moments)


def test_invariant_latest_entry_matches_ticket_status(client, database_url):
    """ADR-001 invariant after every step of new -> in_progress -> closed -> new (reopened)."""
    # Catches: a status written without an entry, or an entry with the wrong to_status.
    clock = ticking_clock()
    with client.app.state.session_factory() as session:
        ticket_id = TicketService(session, clock=clock).create(TicketCreate(**VALID_TICKET)).id
    assert_invariant(database_url, ticket_id)

    for new_status in [Status.IN_PROGRESS, Status.CLOSED, Status.NEW]:
        change_status(client, ticket_id, new_status, clock=clock)
        assert_invariant(database_url, ticket_id)

    assert len(saved_history(database_url, ticket_id)) == 4


# --- The same status is rejected in the service (service part of HIST-07) ---


def test_change_status_to_same_status_is_rejected(client, database_url):
    """HIST-07, service part: new -> new raises SameStatus, and nothing is written.

    An "x -> x" entry would stay forever, since history entries are never changed or
    deleted (AGENTS.md). 409 through the API, for all four statuses, is Nicklas' KSP-27.
    """
    # Catches: the same-status check removed, so a "new -> new" entry is written.
    ticket = create(client)

    with pytest.raises(ticket_service.SameStatus):
        change_status(client, ticket["id"], Status.NEW)

    assert saved_status(database_url, ticket["id"]) == "new"
    assert [e["event_type"] for e in saved_history(database_url, ticket["id"])] == ["created"]
    assert_invariant(database_url, ticket["id"])


# --- Unknown ticket in a status change (HIST-08, through PATCH from KSP-24) ---


def test_hist08_change_status_of_unknown_ticket_gives_404(client, database_url):
    """HIST-08: PATCH on a ticket that does not exist gives 404, and nothing is created."""
    # Catches: TicketNotFound not turned into 404, or a history entry written anyway.
    response = client.patch("/tickets/999/status", json={"status": "closed"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Ärendet finns inte."}
    assert saved_history(database_url) == []
