from fastapi.testclient import TestClient

from app.database import get_session
from app.main import app


def test_unexpected_server_error_uses_generic_error_format_without_details():
    def broken_session():
        raise RuntimeError("secret internal detail")
        yield

    app.dependency_overrides[get_session] = broken_session
    try:
        response = TestClient(app, raise_server_exceptions=False).get(
            "/api/tickets",
            headers={"Origin": "http://localhost:5173"},
        )
    finally:
        app.dependency_overrides.pop(get_session, None)

    assert response.status_code == 500
    assert response.json() == {
        "error": {
            "code": "internal_error",
            "message": "Ett oväntat fel inträffade.",
        }
    }
    assert "secret" not in response.text
    # Webbläsaren får bara läsa felsvaret om CORS-huvudet finns med
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
