"""Reading a ticket's history: GET /tickets/{id}/history (KSP-35).

Covers HIST-03 (entries oldest first, each to_status is the next from_status), HIST-08
(an unknown or non-integer id gives 404 "Ärendet finns inte."), HIST-11 (the same
occurred_at is ordered by id) and HIST-12 (a ticket without changes has exactly one
"created" entry, not an empty list), plus the fields in the contract (HIST section 5).
After each scenario the invariant from ADR-001 is checked through the API: the latest
entry's to_status equals the ticket's status. Part of KSP-39 (Azalea's HIST tests).

PATCH /tickets/{id}/status does not exist yet (KSP-24), so status changes go through
TicketService. The history is read through the API, since that is what KSP-35 builds.
Test proposals: docs/ai/testforslag-v1.md, reviewed by Azalea 2026-10-28.
"""

from datetime import UTC, datetime, timedelta

from app.schemas.tickets import Status, TicketCreate
from app.services.tickets import TicketService

TICKET_NOT_FOUND = "Ärendet finns inte."

# The fields of HistoryEntry in the contract, nothing more (HIST section 5).
CONTRACT_FIELDS = {"id", "event_type", "from_status", "to_status", "occurred_at"}

# A valid body (made-up data).
VALID_TICKET = {
    "title": "Leveransen har inte kommit",
    "description": "Paketet skulle ha levererats i måndags.",
    "category": "delivery",
    "priority": "medium",
}


def create(client, **changes):
    """Create a ticket through the API and return the answer."""
    response = client.post("/tickets", json={**VALID_TICKET, **changes})
    assert response.status_code == 201, response.text
    return response.json()


def change_status(client, ticket_id, new_status, clock=None):
    """Change the status through TicketService in its own session, as one request would."""
    with client.app.state.session_factory() as session:
        service = TicketService(session, clock=clock) if clock else TicketService(session)
        service.change_status(ticket_id, new_status)


def create_with_clock(client, clock):
    """Create a ticket through TicketService with a given clock, and return its id."""
    with client.app.state.session_factory() as session:
        return TicketService(session, clock=clock).create(TicketCreate(**VALID_TICKET)).id


def read_history(client, ticket_id):
    """GET /tickets/{id}/history, which must answer 200."""
    response = client.get(f"/tickets/{ticket_id}/history")
    assert response.status_code == 200, response.text
    return response.json()


def assert_invariant_via_api(client, ticket_id):
    """ADR-001 invariant, read through the API: latest to_status equals the ticket's status."""
    history = read_history(client, ticket_id)
    assert history, "the ticket has no history at all"
    assert history[-1]["to_status"] == client.get(f"/tickets/{ticket_id}").json()["status"]


def ticking_clock(start=datetime(2026, 10, 28, 9, 0, 0, tzinfo=UTC)):
    """A clock that moves one second per call, so every entry has its own time."""
    moments = iter(start + timedelta(seconds=n) for n in range(1000))
    return lambda: next(moments)


def fixed_clock(moment=datetime(2026, 10, 28, 9, 0, 0, tzinfo=UTC)):
    """A clock that stands still, so every entry gets exactly the same time."""
    return lambda: moment


# --- One entry for a new ticket (HIST-12) ---


def test_hist12_new_ticket_history_has_only_created(client):
    """HIST-12: a ticket without changes gives a list with exactly one "created" entry."""
    # Catches: "created" filtered out of the history, or an empty list for a new ticket.
    ticket = create(client)

    [entry] = read_history(client, ticket["id"])

    assert entry["event_type"] == "created"
    assert entry["from_status"] is None
    assert entry["to_status"] == "new"
    assert entry["occurred_at"] == ticket["created_at"]
    assert_invariant_via_api(client, ticket["id"])


# --- Order (HIST-03, HIST-11) ---


def test_hist03_history_is_oldest_first_and_chained(client):
    """HIST-03: entries come oldest first, and each to_status is the next entry's from_status."""
    # Catches: no sorting, or sorting newest first.
    clock = ticking_clock()
    ticket_id = create_with_clock(client, clock)
    for new_status in [Status.IN_PROGRESS, Status.WAITING_ON_CUSTOMER, Status.CLOSED]:
        change_status(client, ticket_id, new_status, clock=clock)

    history = read_history(client, ticket_id)

    assert [entry["event_type"] for entry in history] == ["created"] + ["status_changed"] * 3
    times = [entry["occurred_at"] for entry in history]
    assert times == sorted(times) and len(set(times)) == 4
    for earlier, later in zip(history, history[1:]):
        assert earlier["to_status"] == later["from_status"]
    assert history[-1]["to_status"] == "closed"
    assert_invariant_via_api(client, ticket_id)


def test_hist11_same_time_is_ordered_by_id(client):
    """HIST-11: when entries have the same occurred_at, the lower id comes first."""
    # Catches: id removed as the second sort key, so the order depends on the database.
    clock = fixed_clock()
    ticket_id = create_with_clock(client, clock)
    change_status(client, ticket_id, Status.IN_PROGRESS, clock=clock)
    change_status(client, ticket_id, Status.CLOSED, clock=clock)

    history = read_history(client, ticket_id)

    assert len({entry["occurred_at"] for entry in history}) == 1
    assert [entry["id"] for entry in history] == sorted(entry["id"] for entry in history)
    assert [(e["from_status"], e["to_status"]) for e in history] == [
        (None, "new"),
        ("new", "in_progress"),
        ("in_progress", "closed"),
    ]
    assert_invariant_via_api(client, ticket_id)


# --- Only the ticket's own entries, in the contract's shape ---


def test_history_belongs_to_its_ticket_only(client):
    """HIST-03: a ticket's history holds only its own entries, not another ticket's."""
    # Catches: the filter on ticket_id missing, so all entries are returned.
    first = create(client, title="Första")
    second = create(client, title="Andra")
    change_status(client, first["id"], Status.IN_PROGRESS)

    assert len(read_history(client, first["id"])) == 2
    assert len(read_history(client, second["id"])) == 1
    assert_invariant_via_api(client, first["id"])
    assert_invariant_via_api(client, second["id"])


def test_history_entry_has_exactly_the_contract_fields(client):
    """HIST section 5: every entry has exactly the HistoryEntry fields, no ticket_id."""
    # Catches: database rows sent as they are, instead of through HistoryEntry.
    ticket = create(client)
    change_status(client, ticket["id"], Status.IN_PROGRESS)

    for entry in read_history(client, ticket["id"]):
        assert set(entry) == CONTRACT_FIELDS
    assert_invariant_via_api(client, ticket["id"])


# --- Unknown id (HIST-08) ---


def test_hist08_unknown_ticket_history_gives_404(client):
    """HIST-08: the history of a ticket that does not exist gives 404, not an empty list."""
    # Catches: the check that the ticket exists removed, so the answer is [].
    response = client.get("/tickets/999/history")

    assert response.status_code == 404
    assert response.json() == {"detail": TICKET_NOT_FOUND}


def test_hist08_non_integer_id_history_gives_404(client):
    """HIST-08, B8 (an id that is not an integer is an unknown ticket): /tickets/abc/history gives 404."""
    # Catches: the path error handler from KSP-21 changed so that this gives 422.
    response = client.get("/tickets/abc/history")

    assert response.status_code == 404
    assert response.json() == {"detail": TICKET_NOT_FOUND}
