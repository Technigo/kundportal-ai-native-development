"""Atomicity when the history entry cannot be saved (HIST-09, ADR-001).

If the history entry for a status change fails, the change is rolled back: the API answers
503 "Statusen kunde inte ändras. Försök igen.", the ticket keeps its old status (also when
the file is read with a new engine) and the next change on the same ticket succeeds.
Part of KSP-41 (Azalea's tests for HIST-09), written before the code in KSP-36.

The failure is injected with monkeypatch on HistoryRepository.add, after the ticket has
been created. Only database errors (SQLAlchemyError) give 503 (Azalea, 2026-11-02).
- Variant A: the replacement raises at once, so nothing has reached the database.
- Variant B: the replacement flushes first, so the status UPDATE is in the transaction,
  and then raises. Only a real rollback removes it.

Test proposals: run 4 with docs/ai/testforslag-v2-azalea.md, reviewed by Azalea 2026-11-01
(test 3 changed, test 7 struck). The service test at the end is Azalea's own addition
(2026-11-02): over HTTP every request gets a new session, so only the service can show
that the session is not left broken. The two tests for other errors than database errors
(500) were added after the code in KSP-36, see the comment above them.
"""

import sqlite3

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.main import create_app
from app.repositories.history import HistoryRepository
from app.schemas.tickets import Status
from app.services.tickets import TicketService

STATUS_NOT_CHANGED = "Statusen kunde inte ändras. Försök igen."
UNEXPECTED_ERROR = "Något gick fel. Försök igen."

# A valid body (made-up data).
VALID_TICKET = {
    "title": "Kunden når inte sina fakturor",
    "description": "Sidan med fakturor visar ett tomt fönster sedan i går.",
    "category": "technical",
    "priority": "medium",
}


@pytest.fixture
def api(database_url):
    """A client that returns error responses instead of re-raising them in the test.

    Without this, a missing 503 handler would show up as a raised SQLAlchemyError, not as
    the 500 the user would get.
    """
    with TestClient(create_app(database_url), raise_server_exceptions=False) as test_client:
        yield test_client


def create(client):
    """Create a ticket through the API and return its id."""
    response = client.post("/tickets", json=VALID_TICKET)
    assert response.status_code == 201, response.text
    return response.json()["id"]


def patch_status(client, ticket_id, new_status):
    return client.patch(f"/tickets/{ticket_id}/status", json={"status": new_status})


def fail_at_once(self, row):
    """Variant A: the history entry fails before anything is flushed."""
    raise SQLAlchemyError("simulated failure: INSERT INTO ticket_history failed")


def fail_after_flush(self, row):
    """Variant B: the status UPDATE reaches the transaction, then the entry fails."""
    self.session.flush()
    raise SQLAlchemyError("simulated failure: INSERT INTO ticket_history failed")


def bug_after_flush(self, row):
    """Not a database error: a bug in the code after the status UPDATE reached the transaction."""
    self.session.flush()
    raise RuntimeError("simulated bug while writing the history entry")


def connect(database_url):
    """A new sqlite3 connection to the test file, outside the app's session."""
    connection = sqlite3.connect(database_url.removeprefix("sqlite:///"))
    connection.row_factory = sqlite3.Row
    return connection


def saved_status(database_url, ticket_id):
    """The ticket's status as it is in the file."""
    with connect(database_url) as connection:
        return connection.execute("SELECT status FROM tickets WHERE id = ?", (ticket_id,)).fetchone()[0]


def saved_history(database_url, ticket_id):
    """The ticket's history rows from the file, oldest first."""
    with connect(database_url) as connection:
        rows = connection.execute(
            "SELECT * FROM ticket_history WHERE ticket_id = ? ORDER BY occurred_at, id", (ticket_id,)
        )
        return [dict(row) for row in rows]


def assert_invariant(database_url, ticket_id):
    """ADR-001 invariant, read from the file: the latest to_status equals the ticket's status."""
    history = saved_history(database_url, ticket_id)
    assert history, "the ticket has no history at all"
    assert history[-1]["to_status"] == saved_status(database_url, ticket_id)


# --- The answer (HIST-09, ADR-001: 503, not 500) ---


def test_hist09_failed_history_write_gives_503(api, monkeypatch):
    """HIST-09: a failed history entry gives 503 with the spec's message and nothing else."""
    # Catches: no handler for the error (the general handler gives 500), or a different text.
    ticket_id = create(api)
    monkeypatch.setattr(HistoryRepository, "add", fail_at_once)

    response = patch_status(api, ticket_id, "in_progress")

    assert response.status_code == 503
    assert response.json() == {"detail": STATUS_NOT_CHANGED}


# --- Nothing is saved (variant B: the status has reached the transaction) ---


def test_hist09_status_unchanged_after_failed_history_write(api, database_url, monkeypatch):
    """HIST-09: after a failed history entry the status in the file is still new."""
    # Catches: commit before the history entry, or the status saved in its own transaction.
    ticket_id = create(api)
    monkeypatch.setattr(HistoryRepository, "add", fail_after_flush)

    patch_status(api, ticket_id, "in_progress")

    assert saved_status(database_url, ticket_id) == "new"


def test_hist09_no_new_history_entry_after_failed_write(api, database_url, monkeypatch):
    """HIST-09: after a failed history entry only the "created" entry exists."""
    # The replacement always raises before the entry is added, so this test cannot catch
    # an entry saved without its status. The invariant covers that direction.
    ticket_id = create(api)
    monkeypatch.setattr(HistoryRepository, "add", fail_after_flush)

    patch_status(api, ticket_id, "in_progress")

    history = saved_history(database_url, ticket_id)
    assert [entry["event_type"] for entry in history] == ["created"]


def test_hist09_status_unchanged_with_new_engine(database_url, monkeypatch):
    """HIST-09: a new app on the same file (new engine) still sees the old status."""
    # Catches: commit before the history entry, or any change where the status reaches the file.
    with TestClient(create_app(database_url), raise_server_exceptions=False) as first:
        ticket_id = create(first)
        monkeypatch.setattr(HistoryRepository, "add", fail_after_flush)
        patch_status(first, ticket_id, "in_progress")
    monkeypatch.undo()

    # The first app is closed (lifespan disposes its engine), so this reads the file anew.
    with TestClient(create_app(database_url)) as fresh:
        assert fresh.get(f"/tickets/{ticket_id}").json()["status"] == "new"
        assert len(fresh.get(f"/tickets/{ticket_id}/history").json()) == 1


def test_hist09_rollback_keeps_non_initial_status(api, database_url, monkeypatch):
    """HIST-09: a ticket in in_progress keeps in_progress when the change to closed fails."""
    # Catches: the error handling setting back a fixed status (e.g. new) and committing,
    # and commit before the history entry. A start in new would hide the fixed status.
    ticket_id = create(api)
    assert patch_status(api, ticket_id, "in_progress").status_code == 200
    monkeypatch.setattr(HistoryRepository, "add", fail_after_flush)

    response = patch_status(api, ticket_id, "closed")

    assert response.status_code == 503
    assert saved_status(database_url, ticket_id) == "in_progress"
    assert [entry["event_type"] for entry in saved_history(database_url, ticket_id)] == [
        "created",
        "status_changed",
    ]


# --- The next change works (HIST-09: the session is not left broken) ---


def test_hist09_next_status_change_succeeds(api, database_url, monkeypatch):
    """HIST-09: once the failure is gone, the same change on the same ticket succeeds."""
    # Catches: the failed attempt leaving something behind, e.g. a saved status that gives
    # 409 the second time. Does not catch a missing rollback: every request gets a new
    # session here. The service test below covers that.
    ticket_id = create(api)
    monkeypatch.setattr(HistoryRepository, "add", fail_after_flush)
    patch_status(api, ticket_id, "in_progress")
    monkeypatch.undo()

    second = patch_status(api, ticket_id, "in_progress")

    assert second.status_code == 200
    assert saved_status(database_url, ticket_id) == "in_progress"
    assert len(saved_history(database_url, ticket_id)) == 2
    assert_invariant(database_url, ticket_id)


def test_hist09_same_service_works_after_failure(api, database_url, monkeypatch):
    """HIST-09: the same TicketService and session can change the status again after a failure.

    ADR-001: the service rolls back "so the session can be used again". Over HTTP that is
    hidden, because the session is closed after every request.
    """
    # Catches: rollback removed. The session then still holds in_progress, so the second
    # change is taken for the same status (409) or fails on the broken transaction.
    ticket_id = create(api)
    with api.app.state.session_factory() as session:
        service = TicketService(session)
        monkeypatch.setattr(HistoryRepository, "add", fail_after_flush)
        with pytest.raises(Exception):
            service.change_status(ticket_id, Status.IN_PROGRESS)
        monkeypatch.undo()

        service.change_status(ticket_id, Status.IN_PROGRESS)

    assert saved_status(database_url, ticket_id) == "in_progress"
    assert len(saved_history(database_url, ticket_id)) == 2
    assert_invariant(database_url, ticket_id)


# --- Other errors than database errors: rollback, but 500 (Azalea, 2026-11-02) ---
# Written after the code in KSP-36, because the agent's report showed that no test reached
# this branch. Shown to fail by removing rollback() in the branch for other errors.


def test_hist09_bug_gives_500_and_keeps_old_status(api, database_url, monkeypatch):
    """HIST-09: an error that is not a database error gives 500, and nothing is saved."""
    # Catches: every error turned into 503, which would hide a bug behind "try again".
    ticket_id = create(api)
    monkeypatch.setattr(HistoryRepository, "add", bug_after_flush)

    response = patch_status(api, ticket_id, "in_progress")

    assert response.status_code == 500
    assert response.json() == {"detail": UNEXPECTED_ERROR}
    assert saved_status(database_url, ticket_id) == "new"
    assert [entry["event_type"] for entry in saved_history(database_url, ticket_id)] == ["created"]


def test_hist09_same_service_works_after_bug(api, database_url, monkeypatch):
    """HIST-09: after an error that is not a database error, the same session still works."""
    # Catches: rollback missing in the branch for other errors. The session then still holds
    # in_progress, so the second change is taken for the same status.
    ticket_id = create(api)
    with api.app.state.session_factory() as session:
        service = TicketService(session)
        monkeypatch.setattr(HistoryRepository, "add", bug_after_flush)
        with pytest.raises(RuntimeError):
            service.change_status(ticket_id, Status.IN_PROGRESS)
        monkeypatch.undo()

        service.change_status(ticket_id, Status.IN_PROGRESS)

    assert saved_status(database_url, ticket_id) == "in_progress"
    assert len(saved_history(database_url, ticket_id)) == 2
    assert_invariant(database_url, ticket_id)
