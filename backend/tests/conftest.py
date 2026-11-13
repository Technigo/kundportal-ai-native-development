import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url

from app.database import dispose_engine


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
load_dotenv(REPOSITORY_ROOT / ".env")


def validated_test_url() -> URL:
    raw_url = os.getenv("TEST_DATABASE_URL")
    if not raw_url:
        raise pytest.UsageError("Set TEST_DATABASE_URL to run MySQL integration tests.")

    url = make_url(raw_url)
    if (
        url.drivername != "mysql+pymysql"
        or url.host not in ("127.0.0.1", "localhost")
        or url.port != 3307
        or url.database != "kundportal_test"
        or url.username != "kundportal_test"
    ):
        raise pytest.UsageError(
            "TEST_DATABASE_URL must target the isolated kundportal_test MySQL "
            "database on port 3307 with its dedicated test user."
        )
    return url


@pytest.fixture(scope="session")
def migrated_test_database():
    url = validated_test_url()
    engine = create_engine(url, pool_pre_ping=True)
    with engine.connect() as connection:
        database_name, database_user = connection.execute(
            text(
                "SELECT DATABASE(), "
                "SUBSTRING_INDEX(CURRENT_USER(), '@', 1)"
            )
        ).one()
    if database_name != "kundportal_test" or database_user != "kundportal_test":
        engine.dispose()
        raise pytest.UsageError(
            "Connected MySQL identity did not match the isolated test database."
        )

    previous_database_url = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = url.render_as_string(hide_password=False)
    dispose_engine()
    try:
        config = Config(str(BACKEND_ROOT / "alembic.ini"))
        command.upgrade(config, "head")
        yield engine
    finally:
        dispose_engine()
        if previous_database_url is None:
            os.environ.pop("DATABASE_URL", None)
        else:
            os.environ["DATABASE_URL"] = previous_database_url
        engine.dispose()


@pytest.fixture(autouse=True)
def clear_isolated_ticket_database(request):
    if request.node.get_closest_marker("integration") is None:
        yield
        return

    engine = request.getfixturevalue("migrated_test_database")
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM tickets"))
    try:
        yield
    finally:
        with engine.begin() as connection:
            connection.execute(text("DELETE FROM tickets"))
