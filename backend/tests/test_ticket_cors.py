from fastapi.testclient import TestClient

from app.main import app


def test_frontend_origin_can_preflight_post_and_patch_requests():
    client = TestClient(app)
    origin = "http://localhost:5173"

    for path, method in (
        ("/api/tickets", "POST"),
        ("/api/tickets/1/status", "PATCH"),
    ):
        response = client.options(
            path,
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": method,
                "Access-Control-Request-Headers": "content-type",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin
        assert method in response.headers["access-control-allow-methods"]
