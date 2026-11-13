"""Status and history are kept after a restart (HIST-04, ADR-001).

A restart means: the first app is closed, which runs engine.dispose() in the lifespan, and a
new app is created that reads the database URL from the configuration (DATABASE_URL). If a
change only reached the session and was never committed, it is gone after the restart.
Part of KSP-40 (Azalea's restart tests for HIST-04).

The three tests come from the v2-azalea proposals (docs/ai/testforslag-v2-azalea.md, run 2
in KSP-50), chosen and reviewed by Azalea 2026-11-01. Test 3 is changed by Azalea: the
configured URL must point into tmp_path before app 2 starts, so a broken configuration never
writes to backend/data/app.db. Tried against mutations M3 (no commit in create) and M3b (no
commit in change_status) before they were added here.
"""

import os
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app

# A valid body (made-up data).
VALID_TICKET = {
    "title": "Leveransen kom aldrig fram",
    "description": "Kunden har väntat i två veckor på paketet.",
    "category": "other",
    "priority": "medium",
}


def create(client, **changes):
    """Create a ticket through the API and return the answer."""
    response = client.post("/tickets", json={**VALID_TICKET, **changes})
    assert response.status_code == 201, response.text
    return response.json()


def change(client, ticket_id, status):
    """PATCH the status and return the response."""
    return client.patch(f"/tickets/{ticket_id}/status", json={"status": status})


def test_hist04_status_and_history_unchanged_after_restart(database_url, monkeypatch):
    """HIST-04 (kept after restart): status and history checked against expected values.

    KSP-40 TC1: a ticket with several changes, a new app against the same file, the same
    status and the same entries, all fields.
    """
    # Catches: commit removed in change_status (M3b). The status and the entries are then
    # only in the session of each request and are gone after the restart.
    with TestClient(create_app(database_url)) as first:
        ticket = create(first)
        assert change(first, ticket["id"], "in_progress").status_code == 200
        assert change(first, ticket["id"], "waiting_on_customer").status_code == 200
        ticket_before = first.get(f"/tickets/{ticket['id']}").json()
        history_before = first.get(f"/tickets/{ticket['id']}/history").json()

    # Restart: the first app is closed (engine.dispose()), the new one reads DATABASE_URL.
    monkeypatch.setenv("DATABASE_URL", database_url)
    with TestClient(create_app()) as second:
        ticket_after = second.get(f"/tickets/{ticket['id']}").json()
        history_after = second.get(f"/tickets/{ticket['id']}/history").json()

    # Against expected values, not only against the answer before the restart.
    assert ticket_after["status"] == "waiting_on_customer"
    assert [(e["event_type"], e["from_status"], e["to_status"]) for e in history_after] == [
        ("created", None, "new"),
        ("status_changed", "new", "in_progress"),
        ("status_changed", "in_progress", "waiting_on_customer"),
    ]
    # Field by field equal to the answers before the restart, also id and occurred_at.
    assert ticket_after == ticket_before
    assert history_after == history_before
    # ADR-001 invariant: the latest to_status equals the status.
    assert history_after[-1]["to_status"] == ticket_after["status"]


def test_hist04_created_entry_unchanged_after_restart(database_url, monkeypatch):
    """HIST-04 (kept after restart): a new ticket keeps exactly its created entry."""
    # Catches: commit removed in create (M3). Nothing is then saved, and the ticket is
    # unknown (404) after the restart.
    with TestClient(create_app(database_url)) as first:
        ticket = create(first)
        [entry_before] = first.get(f"/tickets/{ticket['id']}/history").json()

    monkeypatch.setenv("DATABASE_URL", database_url)
    with TestClient(create_app()) as second:
        ticket_response = second.get(f"/tickets/{ticket['id']}")
        history = second.get(f"/tickets/{ticket['id']}/history").json()

    assert ticket_response.status_code == 200
    assert ticket_response.json()["status"] == "new"
    assert len(history) == 1
    [entry] = history
    assert (entry["event_type"], entry["from_status"], entry["to_status"]) == ("created", None, "new")
    assert entry["id"] == entry_before["id"]
    assert entry["occurred_at"] == entry_before["occurred_at"]


def test_hist04_restart_reads_database_url_from_config(database_url, monkeypatch, tmp_path):
    """HIST-04 (kept after restart): app 2 with only DATABASE_URL finds the ticket and history.

    KSP-40 TC2: the new engine reads the file the configuration points to. Changed by
    Azalea: DATABASE_URL must point into tmp_path before app 2 starts, so a broken
    configuration never writes to backend/data/app.db.
    """
    # Catches: the configuration ignores DATABASE_URL and uses the default file or an
    # in-memory database. The new app then finds no ticket.
    with TestClient(create_app(database_url)) as first:
        ticket = create(first)
        history_before = first.get(f"/tickets/{ticket['id']}/history").json()

    monkeypatch.setenv("DATABASE_URL", database_url)
    # Azalea's change: the URL points into tmp_path before app 2 is created.
    configured = Path(os.environ["DATABASE_URL"].removeprefix("sqlite:///")).resolve()
    assert configured.is_relative_to(tmp_path.resolve())

    with TestClient(create_app()) as second:
        response = second.get(f"/tickets/{ticket['id']}")
        history_after = second.get(f"/tickets/{ticket['id']}/history").json()

    assert response.status_code == 200
    assert history_after == history_before
