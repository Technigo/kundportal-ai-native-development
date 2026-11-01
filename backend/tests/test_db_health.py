import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import make_url

from app.database import dispose_engine
from app.main import app


def test_database_health_reports_missing_configuration(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    dispose_engine()

    response = TestClient(app).get("/health/db")

    assert response.status_code == 503
    assert response.json() == {
        "detail": {"status": "unavailable", "database": "unavailable"}
    }


@pytest.mark.integration
def test_database_health_connects_to_mysql_test_database(monkeypatch):
    test_database_url = os.getenv("TEST_DATABASE_URL")
    if not test_database_url:
        pytest.skip("Set TEST_DATABASE_URL to run the MySQL integration test.")

    test_url = make_url(test_database_url)
    if (
        test_url.drivername != "mysql+pymysql"
        or test_url.database != "kundportal_test"
        or test_url.username != "kundportal_test"
    ):
        pytest.fail(
            "TEST_DATABASE_URL must use mysql+pymysql, the "
            "kundportal_test database, and the kundportal_test user."
        )

    monkeypatch.setenv("DATABASE_URL", test_database_url)
    dispose_engine()

    try:
        response = TestClient(app).get("/health/db")
    finally:
        dispose_engine()

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}
