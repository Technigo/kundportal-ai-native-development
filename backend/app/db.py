from collections.abc import Iterator
from pathlib import Path

from fastapi import Request
from sqlalchemy import Engine, event
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    """Alla tabeller ärver från Base så att create_all hittar dem."""


def ensure_sqlite_directory(engine: Engine) -> None:
    """SQLite skapar filen men inte mappen den ska ligga i."""
    url = make_url(str(engine.url))
    if url.get_backend_name() == "sqlite" and url.database not in (None, "", ":memory:"):
        Path(url.database).parent.mkdir(parents=True, exist_ok=True)


def enable_sqlite_foreign_keys(engine: Engine) -> None:
    """Make SQLite check foreign keys, e.g. that a history entry points to a real ticket.

    SQLite ignores FOREIGN KEY unless every new connection turns it on (KSP-33).
    """
    if engine.dialect.name != "sqlite":
        return

    @event.listens_for(engine, "connect")
    def _foreign_keys_on(dbapi_connection, _record):
        dbapi_connection.execute("PRAGMA foreign_keys=ON")


def get_session(request: Request) -> Iterator[Session]:
    """FastAPI-beroende: en session per anrop, stängs när anropet är klart."""
    with request.app.state.session_factory() as session:
        yield session
