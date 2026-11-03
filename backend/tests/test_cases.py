"""
Tests for case CRUD operations.
"""
from fastapi import status


VALID_CATEGORY = "Account"
VALID_PRIORITY = "High"


def test_create_case(client):
    """Test creating a case."""
    response = client.post(
        "/cases/",
        json={
            "title": "Login issue",
            "description": "Cannot login to account",
            "category": VALID_CATEGORY,
            "priority": VALID_PRIORITY,
            "customer_email": "test@example.com",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Login issue"
    assert data["category"] == VALID_CATEGORY
    assert data["priority"] == VALID_PRIORITY
    assert data["status"] == "new"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_case_missing_fields(client):
    """Test creating case with missing required fields."""
    response = client.post("/cases/", json={"title": "Test"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_missing_category(client):
    response = client.post(
        "/cases/",
        json={
            "title": "Test",
            "description": "Desc",
            "priority": VALID_PRIORITY,
            "customer_email": "a@b.com",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_missing_priority(client):
    response = client.post(
        "/cases/",
        json={
            "title": "Test",
            "description": "Desc",
            "category": VALID_CATEGORY,
            "customer_email": "a@b.com",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_invalid_status(client):
    response = client.post(
        "/cases/",
        json={
            "title": "Test",
            "description": "Desc",
            "category": VALID_CATEGORY,
            "priority": VALID_PRIORITY,
            "status": "invalid",
            "customer_email": "a@b.com",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_invalid_category(client):
    response = client.post(
        "/cases/",
        json={
            "title": "Test",
            "description": "Desc",
            "category": "NotACategory",
            "priority": VALID_PRIORITY,
            "customer_email": "a@b.com",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_invalid_priority(client):
    response = client.post(
        "/cases/",
        json={
            "title": "Test",
            "description": "Desc",
            "category": VALID_CATEGORY,
            "priority": "SuperHigh",
            "customer_email": "a@b.com",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_case_invalid_email(client):
    response = client.post(
        "/cases/",
        json={
            "title": "Test",
            "description": "Desc",
            "category": VALID_CATEGORY,
            "priority": VALID_PRIORITY,
            "customer_email": "not-an-email",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_cases(client):
    """Test listing all cases."""
    client.post("/cases/", json={"title": "Case 1", "description": "Desc 1", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "Case 2", "description": "Desc 2", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "c@d.com"})
    response = client.get("/cases/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2


def test_list_cases_empty(client):
    response = client.get("/cases/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_get_case(client):
    """Test getting a case by ID."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
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
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.put(f"/cases/{case_id}", json={"title": "Updated", "status": "in_progress"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated"
    assert data["status"] == "in_progress"


def test_update_case_all_statuses(client):
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    for st in ["new", "in_progress", "waiting_for_customer", "closed"]:
        response = client.put(f"/cases/{case_id}", json={"status": st})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == st


def test_update_case_invalid_status(client):
    """Test updating with invalid status."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.put(f"/cases/{case_id}", json={"status": "invalid"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_update_case_not_found(client):
    """Test updating non-existent case."""
    response = client.put("/cases/nonexistent-id", json={"title": "Test"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_case(client):
    """Test deleting a case."""
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    case_id = create_response.json()["id"]
    response = client.delete(f"/cases/{case_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    get_response = client.get(f"/cases/{case_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_case_not_found(client):
    """Test deleting non-existent case."""
    response = client.delete("/cases/nonexistent-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_case_created_at(client):
    create_response = client.post("/cases/", json={"title": "Test", "description": "Desc", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    data = create_response.json()
    assert data["created_at"] is not None


def test_search_hit(client):
    client.post("/cases/", json={"title": "Login issue", "description": "Cannot login", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "alice@example.com"})
    client.post("/cases/", json={"title": "Billing question", "description": "Invoice problem", "category": "Billing", "priority": "Low", "customer_email": "bob@example.com"})
    response = client.get("/cases/", params={"search": "login"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Login issue"


def test_search_no_hit(client):
    client.post("/cases/", json={"title": "Login issue", "description": "Cannot login", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "alice@example.com"})
    response = client.get("/cases/", params={"search": "zzzznomatch"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_search_empty_returns_all(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "B", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "c@d.com"})
    response = client.get("/cases/", params={"search": "   "})
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 2


def test_search_by_email(client):
    client.post("/cases/", json={"title": "T1", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "alice@example.com"})
    client.post("/cases/", json={"title": "T2", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "bob@example.com"})
    response = client.get("/cases/", params={"search": "bob@"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["customer_email"] == "bob@example.com"


def test_filter_by_status(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "status": "new", "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "B", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "status": "closed", "customer_email": "c@d.com"})
    response = client.get("/cases/", params={"status": "closed"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "closed"


def test_filter_by_status_case_insensitive(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "status": "new", "customer_email": "a@b.com"})
    response = client.get("/cases/", params={"status": "NEW"})
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


def test_filter_by_category(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": "Account", "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "B", "description": "d", "category": "Billing", "priority": VALID_PRIORITY, "customer_email": "c@d.com"})
    response = client.get("/cases/", params={"category": "billing"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "Billing"


def test_filter_by_priority(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": VALID_CATEGORY, "priority": "High", "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "B", "description": "d", "category": VALID_CATEGORY, "priority": "Low", "customer_email": "c@d.com"})
    response = client.get("/cases/", params={"priority": "low"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["priority"] == "Low"


def test_filter_combined(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": "Account", "priority": "High", "status": "new", "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "B", "description": "d", "category": "Account", "priority": "Low", "status": "new", "customer_email": "c@d.com"})
    client.post("/cases/", json={"title": "C", "description": "d", "category": "Billing", "priority": "High", "status": "closed", "customer_email": "e@f.com"})
    response = client.get("/cases/", params={"category": "Account", "priority": "High", "status": "new"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "A"


def test_filter_no_match(client):
    client.post("/cases/", json={"title": "A", "description": "d", "category": VALID_CATEGORY, "priority": VALID_PRIORITY, "customer_email": "a@b.com"})
    response = client.get("/cases/", params={"category": "Billing"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_search_and_filter_combined(client):
    client.post("/cases/", json={"title": "Login issue", "description": "d", "category": "Account", "priority": "High", "customer_email": "a@b.com"})
    client.post("/cases/", json={"title": "Billing issue", "description": "d", "category": "Billing", "priority": "High", "customer_email": "c@d.com"})
    response = client.get("/cases/", params={"search": "issue", "category": "Account"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Login issue"