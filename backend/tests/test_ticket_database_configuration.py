from fastapi.testclient import TestClient

from app.database import dispose_engine
from app.main import app


def test_ticket_api_reports_unavailable_when_database_url_is_missing(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    dispose_engine()

    response = TestClient(app).get("/api/tickets")

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "storage_unavailable"
