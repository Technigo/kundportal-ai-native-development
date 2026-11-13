from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import database_url_from_env
from app.main import create_app


def test_health_reports_ok_when_database_is_reachable(client):
    # Fångar: /health saknas eller ger fel svarsformat.
    # Fångar INTE att databasen aldrig frågas (svaret är detsamma), se testet nedan.
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_health_returns_503_when_database_is_unreachable(tmp_path):
    # Fångar: /health svarar "ok" utan att fråga databasen.
    # Mutationen "kommentera bort SELECT 1" ska få det här testet att falla.
    app = create_app(f"sqlite:///{tmp_path / 'app.db'}")

    with TestClient(app) as client:
        # Efter start: peka sessionen mot en mapp. SQLite kan inte öppna en mapp som databas,
        # så anslutningen misslyckas på riktigt (ingen mock).
        app.state.session_factory = sessionmaker(create_engine(f"sqlite:///{tmp_path}"))

        response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {"detail": "Databasen går inte att nå just nu."}


def test_app_creates_database_file_at_configured_url(tmp_path):
    # Fångar: appen ignorerar den URL den får och skriver till en annan fil.
    db_file = tmp_path / "nested" / "app.db"

    with TestClient(create_app(f"sqlite:///{db_file}")):
        pass

    assert db_file.exists()


def test_database_url_is_read_from_environment(monkeypatch):
    # Fångar: DATABASE_URL i miljön används inte.
    monkeypatch.setenv("DATABASE_URL", "sqlite:///from-env.db")

    assert database_url_from_env() == "sqlite:///from-env.db"
