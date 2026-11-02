import re

import pytest
from fastapi.testclient import TestClient

from app.database import dispose_engine
from app.main import app


@pytest.mark.integration
def test_create_ticket_persists_trimmed_ticket_with_utc_timestamp():
    response = TestClient(app).post(
        "/api/tickets",
        json={
            "customer_id": " \u00a0C-104\t",
            "customer_name": "\nExempelkund ",
            "title": " Fråga om faktura ",
            "description": " Hjälp behövs. ",
            "category": "billing",
            "priority": "normal",
        },
    )

    assert response.status_code == 201
    ticket = response.json()
    assert ticket["customer_id"] == "C-104"
    assert ticket["customer_name"] == "Exempelkund"
    assert ticket["title"] == "Fråga om faktura"
    assert ticket["description"] == "Hjälp behövs."
    assert ticket["category"] == "billing"
    assert ticket["priority"] == "normal"
    assert ticket["status"] == "new"
    assert re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z",
        ticket["created_at"],
    )
    assert response.headers["location"] == f"/api/tickets/{ticket['id']}"
    second_response = TestClient(app).post(
        "/api/tickets",
        json={
            "customer_id": "C-105",
            "customer_name": "Annan exempelkund",
            "title": "En annan fråga",
            "description": "En annan påhittad fråga.",
            "category": "other",
            "priority": "low",
        },
    )
    assert second_response.status_code == 201
    assert second_response.json()["id"] != ticket["id"]

    dispose_engine()
    detail_response = TestClient(app).get(f"/api/tickets/{ticket['id']}")

    assert detail_response.status_code == 200
    assert detail_response.json() == ticket
