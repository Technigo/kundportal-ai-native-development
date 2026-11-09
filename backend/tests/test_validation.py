"""
Tests for validation and error handling of the case API.

These cover missing/invalid required fields, invalid email addresses and invalid
status values, matching the error-path expectations in the test plan (TV-10,
TV-11, TV-16) and the task's requested error handling.
"""
from fastapi import status
import pytest

VALID_CASE = {
    "title": "Login issue",
    "description": "Customer cannot log in to the portal.",
    "category": "Technical support",
    "priority": "High",
    "status": "new",
    "customer_email": "customer@example.com",
}

REQUIRED_FIELDS = ["title", "description", "category", "priority", "status", "customer_email"]


@pytest.mark.parametrize("missing_field", REQUIRED_FIELDS)
def test_create_case_missing_required_field_returns_422(client, missing_field):
    """Omitting any required field rejects the request with 422 (TV-10, TV-11)."""
    payload = {k: v for k, v in VALID_CASE.items() if k != missing_field}
    response = client.post("/cases/", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    detail = response.json()["detail"]
    assert isinstance(detail, list) and detail

    # No case should have been stored as a result of the failed request.
    list_response = client.get("/cases/")
    assert list_response.status_code == status.HTTP_200_OK
    assert list_response.json() == []


@pytest.mark.parametrize("empty_field", ["title", "description", "category", "priority"])
def test_create_case_empty_required_string_returns_422(client, empty_field):
    """An empty string for a required text field is rejected (TV-10)."""
    payload = {**VALID_CASE, empty_field: ""}
    response = client.post("/cases/", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_invalid_email_returns_422(client):
    """An invalid email address is rejected when creating a case."""
    response = client.post("/cases/", json={**VALID_CASE, "customer_email": "not-an-email"})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # The invalid request must not create a case.
    list_response = client.get("/cases/")
    assert list_response.status_code == status.HTTP_200_OK
    assert list_response.json() == []


def test_create_case_invalid_status_returns_422(client):
    """A status outside the four allowed values is rejected on create (TV-16)."""
    response = client.post("/cases/", json={**VALID_CASE, "status": "archived"})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    list_response = client.get("/cases/")
    assert list_response.status_code == status.HTTP_200_OK
    assert list_response.json() == []


def test_create_case_empty_body_returns_422(client):
    """A completely empty request body is rejected."""
    response = client.post("/cases/", json={})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_update_case_invalid_email_returns_422_and_does_not_persist(client):
    """An invalid email on update is rejected and the stored email is preserved."""
    created = client.post("/cases/", json=VALID_CASE)
    assert created.status_code == status.HTTP_201_CREATED
    case_id = created.json()["id"]
    original_email = created.json()["customer_email"]

    response = client.put(f"/cases/{case_id}", json={"customer_email": "not-an-email"})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_200_OK
    assert fetched.json()["customer_email"] == original_email


def test_update_case_empty_title_returns_422_and_does_not_persist(client):
    """An empty title on update is rejected and the stored title is preserved."""
    created = client.post("/cases/", json=VALID_CASE)
    assert created.status_code == status.HTTP_201_CREATED
    case_id = created.json()["id"]
    original_title = created.json()["title"]

    response = client.put(f"/cases/{case_id}", json={"title": ""})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_200_OK
    assert fetched.json()["title"] == original_title


def test_update_case_invalid_status_does_not_change_other_fields(client):
    """When a status update is invalid, no part of the case is changed."""
    created = client.post("/cases/", json=VALID_CASE)
    assert created.status_code == status.HTTP_201_CREATED
    case_id = created.json()["id"]

    response = client.put(
        f"/cases/{case_id}",
        json={"title": "Should not be saved", "status": "not_a_status"},
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_200_OK
    assert fetched.json()["title"] == VALID_CASE["title"]
    assert fetched.json()["status"] == "new"


def test_validation_error_identifies_missing_field(client):
    """A 422 response names the field that failed validation (TV-10, TV-11, F3)."""
    payload = {k: v for k, v in VALID_CASE.items() if k != "title"}
    response = client.post("/cases/", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    detail = response.json()["detail"]
    assert isinstance(detail, list) and detail
    locations = [str(item.get("loc", "")) for item in detail]
    assert any("title" in loc for loc in locations)


# Note: whitespace-only handling is not defined by the requirements (B3).
