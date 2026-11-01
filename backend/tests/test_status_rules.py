"""Status rules, written before the code (tests first for KSP-24).

Covers the rules in API conventions section 1: every change between two *different*
statuses is allowed, HIST-07 (the same status as now gives 409 "Ärendet har redan den
statusen." for all four statuses), HIST-06 (an unknown status gives 422 "Välj en giltig
status.", a wrong type or null gives "Ogiltig indata."), other fields than status in PATCH
("Ogiltig indata.", HIST spec v0.9) and HIST-13 (a closed ticket can be opened again and is
logged as a normal status change). A rejected change leaves the status and the history as
they were. Part of KSP-27 (tests for the status rules).

Written before KSP-24 (PATCH with status rules), when the endpoint answered 501, and run
against it in PR #49. A missing status and a missing body are already tested in
test_error_format.py (KSP-21). Unknown ids (HIST-08), history
order (HIST-03, 11) and atomicity (HIST-09) are Azalea's tests.
"""

import pytest

STATUSES = ["new", "in_progress", "waiting_on_customer", "closed"]
# Every pair of two different statuses: 12 changes.
CHANGES = [(old, new) for old in STATUSES for new in STATUSES if old != new]

SAME_STATUS = "Ärendet har redan den statusen."
INVALID_STATUS = "Välj en giltig status."
INVALID_INPUT = "Ogiltig indata."

# A valid body (made-up data).
VALID_TICKET = {
    "title": "Kunden når inte sitt konto",
    "description": "Inloggningen fastnar efter att lösenordet har bytts.",
    "category": "technical",
    "priority": "medium",
}


def create(client):
    """Create a ticket through the API and return the answer. It starts as "new"."""
    response = client.post("/tickets", json=VALID_TICKET)
    assert response.status_code == 201, response.text
    return response.json()


def change(client, ticket_id, status):
    return client.patch(f"/tickets/{ticket_id}/status", json={"status": status})


def ticket_with_status(client, status):
    """A new ticket moved to `status` (one change, or none for "new")."""
    ticket = create(client)
    if status != "new":
        response = change(client, ticket["id"], status)
        assert response.status_code == 200, response.text
        ticket = response.json()
    return ticket


def history(client, ticket_id):
    response = client.get(f"/tickets/{ticket_id}/history")
    assert response.status_code == 200, response.text
    return response.json()


def assert_nothing_changed(client, ticket_id, status, history_before):
    """A rejected change: same status as before, saved, and no new history entry."""
    response = client.get(f"/tickets/{ticket_id}")
    assert response.status_code == 200
    assert response.json()["status"] == status
    assert history(client, ticket_id) == history_before


# --- Every change between different statuses is allowed (API conventions, section 1) ---


@pytest.mark.parametrize(("old", "new"), CHANGES, ids=[f"{o}->{n}" for o, n in CHANGES])
def test_change_between_different_statuses_is_allowed(client, old, new):
    """All 12 changes between two different statuses give 200 and the ticket gets the new status."""
    # Catches: a rule that blocks some change, e.g. only "forward", or closed as a dead end.
    ticket = ticket_with_status(client, old)

    response = change(client, ticket["id"], new)

    assert response.status_code == 200, response.text
    # Only the status changes. Id, title, created_at and the rest are the same.
    assert response.json() == {**ticket, "status": new}
    # Saved, not just in the answer.
    assert client.get(f"/tickets/{ticket['id']}").json()["status"] == new


# --- Same status as now (HIST-07) ---


@pytest.mark.parametrize("status", STATUSES)
def test_hist07_same_status_gives_409_and_nothing_changes(client, status):
    """HIST-07 (same status): 409 "Ärendet har redan den statusen." for all four statuses."""
    # Catches: the 409 check removed (mutation in the test strategy, section 3), so the same
    # status gives 200 and an extra history entry "new -> new".
    ticket = ticket_with_status(client, status)
    history_before = history(client, ticket["id"])

    response = change(client, ticket["id"], status)

    assert response.status_code == 409
    assert response.json() == {"detail": SAME_STATUS}
    assert_nothing_changed(client, ticket["id"], status, history_before)


# --- Unknown status (HIST-06) ---


@pytest.mark.parametrize(
    ("value", "message"),
    [
        ("klar", INVALID_STATUS),
        ("Avslutat", INVALID_STATUS),
        ("CLOSED", INVALID_STATUS),
        ("", INVALID_STATUS),
        (" closed", INVALID_STATUS),
        (5, INVALID_INPUT),
        (None, INVALID_INPUT),
    ],
    ids=["unknown", "swedish_label", "upper_case", "empty", "leading_space", "wrong_type", "null"],
)
def test_hist06_unknown_status_gives_422_and_nothing_changes(client, value, message):
    """HIST-06 (unknown status): 422, the status stays and no history entry is made."""
    # Catches: a status not in the list being saved, the Swedish label or another spelling
    # accepted as a code, or an invalid change still leaving a history entry.
    # The ticket starts as "in_progress", so a fallback to "new" would also show.
    ticket = ticket_with_status(client, "in_progress")
    history_before = history(client, ticket["id"])

    response = change(client, ticket["id"], value)

    assert response.status_code == 422
    assert response.json() == {"detail": message}
    assert_nothing_changed(client, ticket["id"], "in_progress", history_before)


# --- Other fields than status (HIST spec v0.9, answer in PR #43) ---


@pytest.mark.parametrize(
    "extra",
    [{"title": "x"}, {"note": "x"}],
    ids=["ticket_field", "unknown_field"],
)
def test_other_fields_in_patch_give_422_and_nothing_changes(client, extra):
    """Other fields than status in PATCH give 422 "Ogiltig indata." and nothing changes."""
    # Catches: extra fields silently ignored, so the status changes and the client thinks the
    # title changed too, or a title sent here actually being saved.
    ticket = ticket_with_status(client, "in_progress")
    history_before = history(client, ticket["id"])

    response = client.patch(f"/tickets/{ticket['id']}/status", json={"status": "closed", **extra})

    assert response.status_code == 422
    assert response.json() == {"detail": INVALID_INPUT}
    assert_nothing_changed(client, ticket["id"], "in_progress", history_before)
    assert client.get(f"/tickets/{ticket['id']}").json()["title"] == ticket["title"]


# --- Open a closed ticket again (HIST-13) ---


def test_hist13_closed_ticket_can_be_opened_again(client):
    """HIST-13 (open again): closed -> new is allowed and logged as a normal status change."""
    # Catches: closed treated as final, or reopening done without a history entry.
    ticket = ticket_with_status(client, "closed")

    response = change(client, ticket["id"], "new")

    assert response.status_code == 200
    assert response.json()["status"] == "new"
    latest = history(client, ticket["id"])[-1]
    assert latest["event_type"] == "status_changed"
    assert latest["from_status"] == "closed"
    assert latest["to_status"] == "new"
    # The reopened ticket works like any other: it can be moved on again.
    assert change(client, ticket["id"], "in_progress").status_code == 200
