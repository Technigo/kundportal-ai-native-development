import pytest
from fastapi.testclient import TestClient

from app.main import app
from ticket_examples import VALID_TICKET


@pytest.mark.integration
def test_invalid_json_unknown_fields_and_blank_text_are_422_without_saving():
    client = TestClient(app)
    invalid_requests = [
        (
            client.post(
                "/api/tickets",
                content="{",
                headers={"Content-Type": "application/json"},
            ),
            None,
        ),
        (
            client.post(
                "/api/tickets",
                json={**VALID_TICKET, "unexpected": "value"},
            ),
            "unexpected",
        ),
        (
            client.post(
                "/api/tickets",
                json={
                    key: value
                    for key, value in VALID_TICKET.items()
                    if key != "customer_name"
                },
            ),
            "customer_name",
        ),
        (
            client.post(
                "/api/tickets",
                json={**VALID_TICKET, "customer_id": " \u00a0\t"},
            ),
            "customer_id",
        ),
        (
            client.post(
                "/api/tickets",
                json={**VALID_TICKET, "category": "unknown"},
            ),
            "category",
        ),
        (
            client.post(
                "/api/tickets",
                json={**VALID_TICKET, "priority": "urgent"},
            ),
            "priority",
        ),
    ]

    for response, invalid_field in invalid_requests:
        assert response.status_code == 422
        error = response.json()["error"]
        assert error["code"] == "validation_error"
        if invalid_field:
            assert invalid_field in error["fields"]

    assert client.get("/api/tickets").json() == []


@pytest.mark.integration
@pytest.mark.parametrize(
    "field",
    ("customer_id", "customer_name", "title", "description"),
)
def test_text_fields_containing_only_unicode_whitespace_are_rejected(field):
    response = TestClient(app).post(
        "/api/tickets",
        json={**VALID_TICKET, field: " \t\r\n\u00a0 "},
    )

    assert response.status_code == 422
    assert field in response.json()["error"]["fields"]
    assert TestClient(app).get("/api/tickets").json() == []


@pytest.mark.integration
@pytest.mark.parametrize(
    ("field", "limit"),
    [
        ("customer_id", 100),
        ("customer_name", 200),
        ("title", 100),
        ("description", 5000),
    ],
)
def test_text_fields_accept_limit_and_reject_limit_plus_one(field, limit):
    client = TestClient(app)
    accepted = {**VALID_TICKET, field: "x" * limit}
    rejected = {**VALID_TICKET, field: "x" * (limit + 1)}

    accepted_response = client.post("/api/tickets", json=accepted)
    rejected_response = client.post("/api/tickets", json=rejected)

    assert accepted_response.status_code == 201
    assert rejected_response.status_code == 422
    assert field in rejected_response.json()["error"]["fields"]
    assert [ticket["id"] for ticket in client.get("/api/tickets").json()] == [
        accepted_response.json()["id"]
    ]


@pytest.mark.integration
def test_inner_whitespace_is_preserved_and_length_is_checked_after_trimming():
    response = TestClient(app).post(
        "/api/tickets",
        json={
            **VALID_TICKET,
            "customer_id": f" {'x' * 100} ",
            "customer_name": " Ada  Lovelace \u00a0",
            "description": "\tRad 1\r\nRad\t2\u00a0 ",
        },
    )

    assert response.status_code == 201
    ticket = response.json()
    assert ticket["customer_id"] == "x" * 100
    assert ticket["customer_name"] == "Ada  Lovelace"
    assert ticket["description"] == "Rad 1\r\nRad\t2"


@pytest.mark.integration
@pytest.mark.parametrize(
    "server_field, value",
    (
        ("id", 999),
        ("status", "closed"),
        ("created_at", "2020-01-01T00:00:00.000000Z"),
    ),
)
def test_client_cannot_set_server_controlled_fields_when_registering(
    server_field, value
):
    client = TestClient(app)

    response = client.post("/api/tickets", json={**VALID_TICKET, server_field: value})

    assert response.status_code == 422
    assert server_field in response.json()["error"]["fields"]
    assert client.get("/api/tickets").json() == []


@pytest.mark.integration
@pytest.mark.parametrize(
    "body",
    (
        {**VALID_TICKET, "title": 123},
        {**VALID_TICKET, "title": None},
        {**VALID_TICKET, "category": None},
        [VALID_TICKET],
        "text",
    ),
)
def test_wrong_json_types_are_422_without_saving(body):
    client = TestClient(app)

    response = client.post("/api/tickets", json=body)

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert client.get("/api/tickets").json() == []
