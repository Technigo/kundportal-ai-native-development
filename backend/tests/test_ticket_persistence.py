import pytest
from fastapi.testclient import TestClient

from app.database import dispose_engine
from app.main import app
from ticket_examples import VALID_TICKET


@pytest.mark.integration
def test_ticket_with_swedish_letters_emoji_and_max_length_description_round_trips():
    description = "å" * 4998 + "🙂" + "ö"
    assert len(description) == 5000
    payload = {
        **VALID_TICKET,
        "customer_name": "Åsa Öberg 🙂",
        "title": "Fråga om fakturan åäö 🙂",
        "description": description,
    }
    client = TestClient(app)

    created = client.post("/api/tickets", json=payload).json()
    fetched = client.get(f"/api/tickets/{created['id']}").json()

    for field in ("customer_name", "title", "description"):
        assert fetched[field] == payload[field]


@pytest.mark.integration
def test_ticket_and_status_change_survive_closing_all_connections():
    client = TestClient(app)
    created = client.post("/api/tickets", json=VALID_TICKET).json()
    client.patch(
        f"/api/tickets/{created['id']}/status",
        json={"status": "waiting_for_customer"},
    )

    dispose_engine()
    reopened = TestClient(app).get(f"/api/tickets/{created['id']}")

    assert reopened.status_code == 200
    assert reopened.json() == {**created, "status": "waiting_for_customer"}


@pytest.mark.integration
def test_ids_are_unique_and_increase_with_each_registration():
    client = TestClient(app)

    ids = [client.post("/api/tickets", json=VALID_TICKET).json()["id"] for _ in range(3)]

    assert len(set(ids)) == 3
    assert ids == sorted(ids)
