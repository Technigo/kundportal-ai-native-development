import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import get_session_factory
from app.main import app
from ticket_examples import VALID_TICKET


@pytest.mark.integration
def test_status_updates_preserve_other_fields_and_allow_every_transition():
    client = TestClient(app)
    ticket = client.post("/api/tickets", json=VALID_TICKET).json()
    unchanged_fields = {
        key: value for key, value in ticket.items() if key != "status"
    }

    for status in ("in_progress", "waiting_for_customer", "closed", "new", "new"):
        response = client.patch(
            f"/api/tickets/{ticket['id']}/status",
            json={"status": status},
        )

        assert response.status_code == 200
        updated = response.json()
        assert updated["status"] == status
        assert {key: value for key, value in updated.items() if key != "status"} == (
            unchanged_fields
        )


@pytest.mark.integration
def test_list_is_newest_first_and_filters_one_exact_status():
    client = TestClient(app)
    created = [
        client.post(
            "/api/tickets",
            json={**VALID_TICKET, "title": f"Ärende {index}"},
        ).json()
        for index in range(3)
    ]
    client.patch(
        f"/api/tickets/{created[0]['id']}/status",
        json={"status": "in_progress"},
    )
    client.patch(
        f"/api/tickets/{created[1]['id']}/status",
        json={"status": "closed"},
    )

    all_tickets = client.get("/api/tickets").json()
    active_tickets = client.get(
        "/api/tickets",
        params={"status": "in_progress"},
    )
    no_matches = client.get("/api/tickets", params={"status": "waiting_for_customer"})
    invalid_filter = client.get("/api/tickets", params={"status": "unknown"})

    timestamps = [ticket["created_at"] for ticket in all_tickets]
    assert timestamps == sorted(timestamps, reverse=True)
    assert [ticket["id"] for ticket in active_tickets.json()] == [created[0]["id"]]
    assert no_matches.status_code == 200
    assert no_matches.json() == []
    assert invalid_filter.status_code == 422
    assert invalid_filter.json()["error"]["code"] == "validation_error"


@pytest.mark.integration
def test_invalid_status_and_extra_status_fields_do_not_change_ticket():
    client = TestClient(app)
    ticket = client.post("/api/tickets", json=VALID_TICKET).json()

    invalid_status = client.patch(
        f"/api/tickets/{ticket['id']}/status",
        json={"status": "unknown"},
    )
    extra_field = client.patch(
        f"/api/tickets/{ticket['id']}/status",
        json={"status": "closed", "title": "not allowed"},
    )

    assert invalid_status.status_code == 422
    assert extra_field.status_code == 422
    assert client.get(f"/api/tickets/{ticket['id']}").json() == ticket


@pytest.mark.integration
def test_choosing_the_current_status_again_succeeds_and_changes_nothing():
    client = TestClient(app)
    created = client.post("/api/tickets", json=VALID_TICKET).json()

    response = client.patch(
        f"/api/tickets/{created['id']}/status",
        json={"status": created["status"]},
    )

    assert response.status_code == 200
    assert response.json() == created
    assert client.get(f"/api/tickets/{created['id']}").json() == created


@pytest.mark.integration
def test_tickets_with_identical_created_at_are_listed_highest_id_first():
    insert = text(
        "INSERT INTO tickets "
        "(customer_id, customer_name, title, description, category, priority, status, created_at) "
        "VALUES ('C-1', 'Exempelkund', :title, 'Text', 'billing', 'normal', 'new', "
        "'2026-11-01 10:00:00.000000')"
    )
    with get_session_factory()() as session:
        for title in ("Första", "Andra", "Tredje"):
            session.execute(insert, {"title": title})
        session.commit()

    tickets = TestClient(app).get("/api/tickets").json()

    assert [ticket["title"] for ticket in tickets] == ["Tredje", "Andra", "Första"]
