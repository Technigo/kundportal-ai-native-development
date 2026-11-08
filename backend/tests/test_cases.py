"""
Tests for case CRUD operations against the backend API.

These tests focus on the behaviours that are actually implemented by the
backend: creating, listing, retrieving, updating and deleting cases, as well
as persistence of the saved values within a request/session.
"""
from fastapi import status
import pytest

VALID_CASE = {
    "title": "Login issue",
    "description": "Customer cannot log in to the portal.",
    "category": "Technical support",
    "priority": "High",
    "customer_email": "customer@example.com",
}

ALLOWED_STATUSES = ["new", "in_progress", "waiting_for_customer", "closed"]


def _create_case(client, **overrides):
    payload = {**VALID_CASE, **overrides}
    return client.post("/cases/", json=payload)


def test_create_case_returns_201_and_persists_all_fields(client):
    """Creating a valid case stores every submitted field and returns them."""
    response = _create_case(client)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == VALID_CASE["title"]
    assert data["description"] == VALID_CASE["description"]
    assert data["category"] == VALID_CASE["category"]
    assert data["priority"] == VALID_CASE["priority"]
    assert data["customer_email"] == VALID_CASE["customer_email"]
    assert data["status"] == "new"
    assert isinstance(data["id"], str) and data["id"]
    assert "created_at" in data and data["created_at"]
    assert "updated_at" in data and data["updated_at"]


def test_create_case_defaults_status_to_new(client):
    """Status defaults to 'new' when it is omitted from the request."""
    payload = {k: v for k, v in VALID_CASE.items()}
    response = client.post("/cases/", json=payload)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["status"] == "new"


@pytest.mark.parametrize("status_value", ALLOWED_STATUSES)
def test_create_case_accepts_each_allowed_status(client, status_value):
    """Every allowed status value can be stored when creating a case (TV-03)."""
    response = _create_case(client, status=status_value)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["status"] == status_value


def test_list_cases_is_empty_when_no_cases_exist(client):
    """The case list is empty (not an error) when storage holds no cases (TV-04)."""
    response = client.get("/cases/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_list_cases_returns_exactly_the_created_cases(client):
    """Listing returns all created cases and no extras (TV-05, F1)."""
    first = _create_case(client, title="Case alpha", customer_email="alpha@example.com")
    second = _create_case(client, title="Case beta", customer_email="beta@example.com")

    assert first.status_code == status.HTTP_201_CREATED
    assert second.status_code == status.HTTP_201_CREATED
    expected_ids = {first.json()["id"], second.json()["id"]}

    response = client.get("/cases/")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    assert {item["id"] for item in data} == expected_ids
    assert {item["title"] for item in data} == {"Case alpha", "Case beta"}


def test_create_case_appears_in_case_list(client):
    """A newly created case is present in the list (TV-08, TV-13)."""
    created = _create_case(client)
    case_id = created.json()["id"]

    response = client.get("/cases/")

    assert response.status_code == status.HTTP_200_OK
    assert any(item["id"] == case_id for item in response.json())


def test_get_case_returns_correct_case_among_multiple(client):
    """Retrieving by id returns the matching case, not another one (TV-07, TV-16)."""
    first = _create_case(client, title="First case", customer_email="first@example.com")
    second = _create_case(client, title="Second case", customer_email="second@example.com")

    first_id = first.json()["id"]
    second_id = second.json()["id"]

    first_response = client.get(f"/cases/{first_id}")
    second_response = client.get(f"/cases/{second_id}")

    assert first_response.status_code == status.HTTP_200_OK
    assert first_response.json()["id"] == first_id
    assert first_response.json()["title"] == "First case"

    assert second_response.status_code == status.HTTP_200_OK
    assert second_response.json()["id"] == second_id
    assert second_response.json()["title"] == "Second case"


def test_get_case_returns_all_required_fields(client):
    """The detail response contains all fields required by FR-16 (TV-14)."""
    created = _create_case(client, status="in_progress")
    case_id = created.json()["id"]

    response = client.get(f"/cases/{case_id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    for field in ("id", "title", "description", "category", "priority", "status",
                  "customer_email", "created_at", "updated_at"):
        assert field in data
    assert data["title"] == VALID_CASE["title"]
    assert data["description"] == VALID_CASE["description"]
    assert data["category"] == VALID_CASE["category"]
    assert data["priority"] == VALID_CASE["priority"]
    assert data["status"] == "in_progress"
    assert data["customer_email"] == VALID_CASE["customer_email"]


def test_get_case_not_found_returns_404(client):
    """Requesting a case that does not exist returns 404 (TV-07 error path)."""
    response = client.get("/cases/does-not-exist")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Case not found"


def test_update_case_changes_fields_and_preserves_identity(client):
    """Updating a case stores the new values in the same record (TV-13, TV-15, F4)."""
    created = _create_case(client)
    case_id = created.json()["id"]
    original_created_at = created.json()["created_at"]

    response = client.put(
        f"/cases/{case_id}",
        json={
            "title": "Updated title",
            "description": "Updated description",
            "category": "Billing",
            "priority": "Low",
            "status": "in_progress",
            "customer_email": "updated@example.com",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == case_id
    assert data["title"] == "Updated title"
    assert data["description"] == "Updated description"
    assert data["category"] == "Billing"
    assert data["priority"] == "Low"
    assert data["status"] == "in_progress"
    assert data["customer_email"] == "updated@example.com"
    assert data["created_at"] == original_created_at

    # The change must also be visible when the case is fetched again.
    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_200_OK
    assert fetched.json()["title"] == "Updated title"
    assert fetched.json()["status"] == "in_progress"


def test_update_case_partial_update_leaves_other_fields_unchanged(client):
    """A partial update changes only the supplied fields."""
    created = _create_case(client)
    case_id = created.json()["id"]

    response = client.put(f"/cases/{case_id}", json={"title": "Only title changed"})

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Only title changed"
    assert data["description"] == VALID_CASE["description"]
    assert data["category"] == VALID_CASE["category"]
    assert data["priority"] == VALID_CASE["priority"]
    assert data["customer_email"] == VALID_CASE["customer_email"]
    assert data["status"] == "new"


@pytest.mark.parametrize("status_value", ALLOWED_STATUSES)
def test_update_case_status_to_each_allowed_value(client, status_value):
    """A case can be updated to any of the four allowed statuses (TV-15, TV-17)."""
    created = _create_case(client, status="new")
    case_id = created.json()["id"]

    response = client.put(f"/cases/{case_id}", json={"status": status_value})

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == status_value

    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_200_OK
    assert fetched.json()["status"] == status_value


def test_update_case_invalid_status_returns_422_and_does_not_persist(client):
    """An invalid status is rejected and the previous status is preserved (TV-16, F5)."""
    created = _create_case(client, status="new")
    case_id = created.json()["id"]

    response = client.put(f"/cases/{case_id}", json={"status": "invalid_status"})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_200_OK
    assert fetched.json()["status"] == "new"


def test_update_case_not_found_returns_404(client):
    """Updating a case that does not exist returns 404."""
    response = client.put("/cases/does-not-exist", json={"title": "Updated"})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Case not found"


def test_delete_case_returns_204_and_case_becomes_unavailable(client):
    """Deleting a case returns 204 and the case can no longer be fetched (TV-18)."""
    created = _create_case(client)
    case_id = created.json()["id"]

    response = client.delete(f"/cases/{case_id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    fetched = client.get(f"/cases/{case_id}")
    assert fetched.status_code == status.HTTP_404_NOT_FOUND


def test_delete_case_not_found_returns_404(client):
    """Deleting a case that does not exist returns 404."""
    response = client.delete("/cases/does-not-exist")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Case not found"


def test_delete_case_removes_case_from_list(client):
    """A deleted case no longer appears in the case list (TV-18, TV-19)."""
    first = _create_case(client, title="Keep me", customer_email="keep@example.com")
    second = _create_case(client, title="Delete me", customer_email="delete@example.com")

    keep_id = first.json()["id"]
    delete_id = second.json()["id"]

    delete_response = client.delete(f"/cases/{delete_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    list_response = client.get("/cases/")
    assert list_response.status_code == status.HTTP_200_OK
    data = list_response.json()
    assert len(data) == 1
    assert data[0]["id"] == keep_id
    assert all(item["id"] != delete_id for item in data)
