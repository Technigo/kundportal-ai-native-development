"""
Tests for search and filtering of cases (TV-20, TV-21, TV-22, F6).
"""
from fastapi import status
import pytest

CASES = [
    {
        "title": "Login issue",
        "description": "Customer cannot log in.",
        "category": "Technical support",
        "priority": "High",
        "status": "new",
        "customer_email": "alice@example.com",
    },
    {
        "title": "Billing question",
        "description": "Invoice missing.",
        "category": "Billing",
        "priority": "Low",
        "status": "new",
        "customer_email": "bob@example.com",
    },
    {
        "title": "Account locked",
        "description": "Locked after failed attempts.",
        "category": "Account",
        "priority": "Urgent",
        "status": "new",
        "customer_email": "carol@example.com",
    },
]


def _create_all(client):
    ids = []
    for case in CASES:
        r = client.post("/cases/", json=case)
        assert r.status_code == status.HTTP_201_CREATED
        ids.append(r.json()["id"])
    return ids


def test_search_returns_exact_matching_set(client):
    ids = _create_all(client)

    response = client.get("/cases/", params={"search": "Billing"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Billing question"
    assert data[0]["id"] == ids[1]

    response = client.get("/cases/", params={"search": "carol@example.com"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["customer_email"] == "carol@example.com"

    response = client.get("/cases/", params={"search": "Account locked"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Account locked"

def test_search_is_case_insensitive(client):
    _create_all(client)
    response = client.get("/cases/", params={"search": "billing"})
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Billing question"


def test_search_no_match_returns_empty(client):
    _create_all(client)
    response = client.get("/cases/", params={"search": "zzzz-no-such-term"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_search_empty_returns_all(client):
    ids = _create_all(client)
    response = client.get("/cases/", params={"search": ""})
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 3
    assert {item["id"] for item in response.json()} == set(ids)


def test_filter_by_status_returns_exact_set(client):
    r1 = client.post("/cases/", json={**CASES[0], "status": "new"})
    r2 = client.post("/cases/", json={**CASES[1], "status": "closed"})
    r3 = client.post("/cases/", json={**CASES[2], "status": "closed"})
    assert all(r.status_code == status.HTTP_201_CREATED for r in (r1, r2, r3))

    response = client.get("/cases/", params={"status": "closed"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    assert {item["title"] for item in data} == {"Billing question", "Account locked"}

    response = client.get("/cases/", params={"status": "new"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Login issue"


def test_filter_by_status_no_match_returns_empty(client):
    _create_all(client)
    response = client.get("/cases/", params={"status": "definitely_not_a_status"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_filter_by_priority_returns_exact_set(client):
    _create_all(client)
    response = client.get("/cases/", params={"priority": "Urgent"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Account locked"

    response = client.get("/cases/", params={"priority": "High"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Login issue"


def test_filter_no_match_returns_empty(client):
    _create_all(client)
    response = client.get("/cases/", params={"priority": "Nonexistent priority"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []
