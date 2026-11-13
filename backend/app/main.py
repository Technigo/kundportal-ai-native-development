from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api import health, tickets
from app.config import database_url_from_env
from app.db import Base, enable_sqlite_foreign_keys, ensure_sqlite_directory
from app.errors import register_error_handlers


def create_app(database_url: str | None = None) -> FastAPI:
    """Bygger appen mot en given databas. Tester skickar in en temporär fil."""
    engine = create_engine(database_url or database_url_from_env())
    # The history's link to its ticket is checked by the database too (KSP-33).
    enable_sqlite_foreign_keys(engine)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        ensure_sqlite_directory(engine)
        Base.metadata.create_all(engine)
        yield
        engine.dispose()

    app = FastAPI(title="Kundserviceportalen", lifespan=lifespan)
    app.state.session_factory = sessionmaker(engine)
    # Every error as {"detail": "<Swedish message>"} (KSP-21, CORE-16, HIST-14).
    register_error_handlers(app)
    app.include_router(health.router)
    app.include_router(tickets.router)
    return app


# Används av `uvicorn app.main:app`. create_engine ansluter inte förrän appen startar.
app = create_app()
