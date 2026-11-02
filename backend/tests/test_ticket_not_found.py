import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.mark.integration
def test_unknown_ticket_id_returns_404_for_read_and_status_change():
    client = TestClient(app)

    detail_response = client.get("/api/tickets/2147483647")
    status_response = client.patch(
        "/api/tickets/2147483647/status",
        json={"status": "closed"},
    )

    assert detail_response.status_code == 404
    assert detail_response.json()["error"]["code"] == "not_found"
    assert status_response.status_code == 404
    assert status_response.json()["error"]["code"] == "not_found"
    assert client.get("/api/tickets").json() == []


@pytest.mark.parametrize("ticket_id", (0, -1))
def test_non_positive_ticket_id_is_invalid_input(ticket_id):
    client = TestClient(app)

    detail_response = client.get(f"/api/tickets/{ticket_id}")
    status_response = client.patch(
        f"/api/tickets/{ticket_id}/status",
        json={"status": "closed"},
    )

    assert detail_response.status_code == 422
    assert detail_response.json()["error"]["code"] == "validation_error"
    assert status_response.status_code == 422
    assert status_response.json()["error"]["code"] == "validation_error"
