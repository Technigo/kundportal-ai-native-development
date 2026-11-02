import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def database_url(tmp_path):
    """Varje test får en egen SQLite-fil som tas bort efteråt."""
    return f"sqlite:///{tmp_path / 'test.db'}"


@pytest.fixture
def client(database_url):
    # `with` kör appens uppstart och nedstängning (lifespan), precis som uvicorn gör.
    with TestClient(create_app(database_url)) as test_client:
        yield test_client


def assert_invariant_via_api(client, ticket_id):
    """ADR-001 invariant, read through the API: latest to_status equals the ticket's status.

    Shared by test_read_history.py and test_status_rules.py (Azalea's suggestion in PR #63).
    test_history.py keeps its own version on purpose: it reads the SQLite file directly, a
    different channel than the API that wrote the data.
    """
    response = client.get(f"/tickets/{ticket_id}/history")
    assert response.status_code == 200, response.text
    history = response.json()
    assert history, "the ticket has no history at all"
    assert history[-1]["to_status"] == client.get(f"/tickets/{ticket_id}").json()["status"]
