"""
Test configuration and fixtures.
"""
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)

    class SyncClient:
        def __init__(self):
            self.transport = transport

        def request(self, method, url, json=None, **kwargs):
            async def _request():
                async with AsyncClient(transport=self.transport, base_url="http://test") as ac:
                    return await ac.request(method, url, json=json, **kwargs)
            return asyncio.get_event_loop().run_until_complete(_request())

        def get(self, url, **kwargs):
            return self.request("GET", url, **kwargs)

        def post(self, url, json=None, **kwargs):
            return self.request("POST", url, json=json, **kwargs)

        def put(self, url, json=None, **kwargs):
            return self.request("PUT", url, json=json, **kwargs)

        def delete(self, url, **kwargs):
            return self.request("DELETE", url, **kwargs)

    try:
        yield SyncClient()
    finally:
        app.dependency_overrides.clear()
