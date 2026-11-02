from contextlib import contextmanager
from typing import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError

from app.database import dispose_engine, get_session, get_session_factory
from app.main import app
from ticket_examples import VALID_TICKET


@contextmanager
def inject_session_failure_at(event_name: str, message: str) -> Iterator[None]:
    def failing_session():
        session = get_session_factory()()

        def fail(*args):
            raise SQLAlchemyError(message)

        # Keep the transaction on real MySQL while failing at a deterministic stage.
        event.listen(session, event_name, fail, once=True)
        try:
            yield session
        finally:
            session.close()

    previous_override = app.dependency_overrides.get(get_session)
    app.dependency_overrides[get_session] = failing_session
    try:
        yield
    finally:
        if previous_override is None:
            app.dependency_overrides.pop(get_session, None)
        else:
            app.dependency_overrides[get_session] = previous_override
        dispose_engine()


@pytest.mark.integration
def test_failure_after_insert_before_commit_rolls_back_confirmed_write():
    with inject_session_failure_at(
        "after_flush",
        "controlled failure after SQL insert and before commit",
    ):
        response = TestClient(app).post("/api/tickets", json=VALID_TICKET)

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "storage_unavailable"
    assert TestClient(app).get("/api/tickets").json() == []


@pytest.mark.integration
def test_error_before_database_commit_is_reported_as_unknown():
    # before_commit fires before MySQL commits, so this does not prove persistence.
    with inject_session_failure_at("before_commit", "controlled commit uncertainty"):
        response = TestClient(app).post("/api/tickets", json=VALID_TICKET)

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "save_outcome_unknown"
    assert "kunde inte bekräftas" in response.json()["error"]["message"]
    assert TestClient(app).get("/api/tickets").json() == []


@pytest.mark.integration
def test_error_after_database_commit_reports_unknown_and_ticket_persists():
    # after_commit raises only after MySQL has committed the transaction.
    with inject_session_failure_at("after_commit", "controlled post-commit failure"):
        response = TestClient(app).post("/api/tickets", json=VALID_TICKET)

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "save_outcome_unknown"
    assert "kunde inte bekräftas" in response.json()["error"]["message"]

    persisted_tickets = TestClient(app).get("/api/tickets").json()

    assert len(persisted_tickets) == 1
    persisted_ticket = persisted_tickets[0]
    assert {
        field: persisted_ticket[field] for field in VALID_TICKET
    } == VALID_TICKET
    assert persisted_ticket["id"] > 0
    assert persisted_ticket["status"] == "new"


@pytest.mark.integration
def test_failure_during_status_write_rolls_back_to_previous_ticket():
    client = TestClient(app)
    ticket = client.post("/api/tickets", json=VALID_TICKET).json()

    with inject_session_failure_at(
        "after_flush",
        "controlled failure after SQL update and before commit",
    ):
        response = client.patch(
            f"/api/tickets/{ticket['id']}/status",
            json={"status": "closed"},
        )

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "storage_unavailable"
    assert client.get(f"/api/tickets/{ticket['id']}").json() == ticket
