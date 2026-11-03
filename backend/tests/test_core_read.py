"""CORE rules for reading tickets, written before the code (tests first for KSP-23).

Covers CORE-02 (a ticket is kept after a restart), CORE-03 (the list holds all tickets,
newest first, then highest id first, B5), CORE-04 (reading a ticket gives exactly what
was saved), CORE-10 (an unknown id gives 404 "Ärendet finns inte.") and CORE-15 (an empty
list is 200 with [], not an error). Part of KSP-25 (CORE tests: create, list, show and restart).

Written before KSP-23 (list and show tickets), when GET answered 501, and now run against
it. An id that is not an integer (B8) is already
tested in test_error_format.py (KSP-21). Test proposals reviewed by Nicklas 2026-10-28.
"""

from datetime import UTC, datetime

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.tickets import TicketCreate
from app.services.tickets import TicketService

TICKET_NOT_FOUND = "Ärendet finns inte."

# A valid body (made-up data).
VALID_TICKET = {
    "title": "Fakturan har fel belopp",
    "description": "Kunden har fått dubbel debitering för oktober.",
    "category": "billing",
    "priority": "high",
}


def create(client, title):
    """Create a ticket through the API and return the answer."""
    response = client.post("/tickets", json={**VALID_TICKET, "title": title})
    assert response.status_code == 201, response.text
    return response.json()


# --- Read one ticket (CORE-04, CORE-10) ---


def test_core04_get_returns_exactly_what_was_saved(client):
    """CORE-04 (read a ticket): 200 with the same fields and values as when it was created."""
    # Catches: GET reading the wrong row, or a field missing or changed in the answer.
    created = create(client, "Åtgärd för ärende 😊")

    response = client.get(f"/tickets/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_core10_unknown_integer_id_returns_404(client):
    """CORE-10 (unknown id): 404 "Ärendet finns inte.", also when other tickets exist."""
    # Catches: an unknown id answered with 200 and null, or a 500 from a missing row.
    create(client, "Ett ärende som finns")

    response = client.get("/tickets/999")

    assert response.status_code == 404
    assert response.json() == {"detail": TICKET_NOT_FOUND}


# --- Kept after restart (CORE-02) ---


def test_core02_ticket_survives_restart(database_url):
    """CORE-02 (kept after restart): a new app on the same database file still has the ticket."""
    # Catches: a database kept in memory, or a ticket that is flushed but never committed.
    with TestClient(create_app(database_url)) as first:
        created = create(first, "Fakturan har fel belopp")

    with TestClient(create_app(database_url)) as second:
        response = second.get(f"/tickets/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


# --- The list (CORE-03, CORE-15) ---


def test_core15_empty_list_returns_200(client):
    """CORE-15 (no tickets): the list is 200 with [], not 404 or an error."""
    # Catches: an empty list treated as "not found".
    response = client.get("/tickets")

    assert response.status_code == 200
    assert response.json() == []


def test_core03_list_is_newest_first(client):
    """CORE-03, B5 (newest first): all tickets are in the list, the last created first."""
    # Catches: ascending order, or a list that leaves out tickets.
    first = create(client, "Första")
    second = create(client, "Andra")
    third = create(client, "Tredje")

    response = client.get("/tickets")

    assert response.status_code == 200
    assert response.json() == [third, second, first]


def test_core03_same_created_at_is_ordered_by_id_desc(client):
    """CORE-03, B5: with the same created_at, the highest id comes first.

    Two tickets almost never get the same time through the API, so they are created
    through TicketService with a clock that stands still (the replaceable clock from KSP-22).
    """
    # Catches: id removed as the second sort key, so the order depends on the database.
    def fixed_clock():
        return datetime(2026, 10, 28, 9, 0, 0, tzinfo=UTC)

    with client.app.state.session_factory() as session:
        service = TicketService(session, clock=fixed_clock)
        older = service.create(TicketCreate(**{**VALID_TICKET, "title": "Lägre id"})).id
        newer = service.create(TicketCreate(**{**VALID_TICKET, "title": "Högre id"})).id

    response = client.get("/tickets")

    assert response.status_code == 200
    assert [ticket["id"] for ticket in response.json()] == [newer, older]
    assert {ticket["created_at"] for ticket in response.json()} == {"2026-10-28T09:00:00.000000Z"}


def test_core03_list_items_match_get(client):
    """CORE-03, CORE-04: a ticket in the list has the same fields as GET /tickets/{id}."""
    # Catches: the list answering with fewer fields than the single ticket.
    created = create(client, "Fakturan har fel belopp")

    [listed] = client.get("/tickets").json()

    assert listed == client.get(f"/tickets/{created['id']}").json()
