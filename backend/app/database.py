import os
from functools import lru_cache
from pathlib import Path
from typing import Iterator

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.api_errors import ApiError


ROOT_DIRECTORY = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIRECTORY / ".env")


class DatabaseConfigurationError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise DatabaseConfigurationError("DATABASE_URL is not configured.")

    return create_engine(database_url, pool_pre_ping=True)


@lru_cache(maxsize=1)
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False)


def get_session() -> Iterator[Session]:
    try:
        factory = get_session_factory()
    except (DatabaseConfigurationError, SQLAlchemyError) as error:
        raise ApiError(
            503,
            "storage_unavailable",
            "Lagringen är tillfälligt otillgänglig.",
        ) from error
    with factory() as session:
        yield session


def check_database_connection() -> None:
    engine = get_engine()
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))


def dispose_engine() -> None:
    if get_engine.cache_info().currsize:
        get_engine().dispose()
    get_session_factory.cache_clear()
    get_engine.cache_clear()
