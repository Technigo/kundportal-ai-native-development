"""
Tests for case CRUD operations.
"""
from fastapi import status


def test_create_case(client):
    """Test creating a case."""
    response = client.post(
        "/cases/",
        json={
            "title": "Login issue",
            "description": "Cannot login to account",
            "category": "technical",
            "priority": "high",
            "customer_email": "test@example.com",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Login issue"
    assert data["status"] == "new"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_case_missing_fields(client):
    """Test creating case with missing required fields."""
    response = client.post("/cases/", json={"title": "Test"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_cases(client):
    """Test listing all cases."""
    client.post("/cases/", json={"title": "Case 1", "description": "Desc 1", "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "Case 2", "description": "Desc 2", "customer_email": "c@d.com"})
    response = client.get("/cases/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2


def test_get_case(client):
    """Test getting a case by ID."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.get(f"/cases/{case_id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Test"


def test_get_case_not_found(client):
    """Test getting non-existent case."""
    response = client.get("/cases/nonexistent-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_case(client):
    """Test updating a case."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.put(f"/cases/{case_id}", json={"title": "Updated", "status": "in_progress"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated"
    assert data["status"] == "in_progress"


def test_update_case_invalid_status(client):
    """Test updating with invalid status."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.put(f"/cases/{case_id}", json={"status": "invalid"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_update_case_not_found(client):
    """Test updating non-existent case."""
    response = client.put("/cases/nonexistent-id", json={"title": "Test"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_case(client):
    """Test deleting a case."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.delete(f"/cases/{case_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = client.get(f"/cases/{case_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_case_not_found(client):
    """Test deleting non-existent case."""
    response = client.delete("/cases/nonexistent-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND
