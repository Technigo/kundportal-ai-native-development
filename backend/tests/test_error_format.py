"""KSP-21: every API error is {"detail": "<Swedish message>"}.

Covers CORE-09 (status sent on create), CORE-10 (unknown or non-integer id gives 404),
CORE-16 (Swedish errors, no stacktrace, SQL or English field names), CORE-17 (wrong type,
missing body, broken JSON or invalid UTF-8 gives only "Ogiltig indata."), CORE-18 (several
errors are joined in field order) and the backend part of HIST-14 (same error format for
status and history).

The endpoints were stubs that answered 501 when these tests were written. All are built
now (KSP-22 to KSP-24, KSP-35), so a request that passes validation reaches real code.
"No ticket is saved" and trimming (B10, B12) are tested in test_create_ticket.py (KSP-22).
"""

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

# Messages from CORE section 4 and the KSP-21 assignment. Tests compare exact text.
TITLE_REQUIRED = "Rubrik måste fyllas i."
TITLE_TOO_LONG = "Rubriken får vara högst 100 tecken."
DESCRIPTION_TOO_LONG = "Beskrivningen får vara högst 2000 tecken."
DESCRIPTION_REQUIRED = "Beskrivning måste fyllas i."
INVALID_CATEGORY = "Välj en giltig kategori."
INVALID_PRIORITY = "Välj en giltig prioritet."
STATUS_NOT_ALLOWED = "Status sätts automatiskt och kan inte anges när ett ärende skapas."
# HIST section 5: unknown or missing status.
INVALID_STATUS = "Välj en giltig status."
INVALID_INPUT = "Ogiltig indata."
TICKET_NOT_FOUND = "Ärendet finns inte."
PAGE_NOT_FOUND = "Sidan finns inte."
METHOD_NOT_ALLOWED = "Metoden stöds inte."
UNEXPECTED_ERROR = "Något gick fel. Försök igen."

# A valid body (made-up data), so that only the field under test is wrong.
VALID_TICKET = {
    "title": "Fakturan har fel belopp",
    "description": "Kunden har fått dubbel debitering för oktober.",
    "category": "billing",
    "priority": "high",
}

JSON_HEADERS = {"content-type": "application/json"}

# Text that must never reach the user: English field names and framework defaults.
FORBIDDEN_IN_DETAIL = [
    "title",
    "description",
    "category",
    "priority",
    "ticket_id",
    "Field required",
    "Not Found",
    "Method Not Allowed",
    "There was an error",
    "Traceback",
]


def ticket_with(**changes):
    """VALID_TICKET with some fields replaced, or removed when the value is None."""
    body = {**VALID_TICKET, **changes}
    return {key: value for key, value in body.items() if value is not None}


def without(*fields):
    """VALID_TICKET without the given fields."""
    return {key: value for key, value in VALID_TICKET.items() if key not in fields}


def assert_error(response, status_code, detail):
    """The response has the expected code and exactly {"detail": detail}."""
    assert response.status_code == status_code, response.text
    assert response.json() == {"detail": detail}


# --- A. Field messages and field order (CORE-09, CORE-18) ---


def test_core18_valid_body_passes_validation(client):
    """CORE-18 happy path: a valid body is not turned into a 422 by the error handler."""
    # Catches: a handler that answers 422 for every request. Since KSP-22 a valid body is
    # created (201); before that, 501 from the stub showed the same thing.
    assert client.post("/tickets", json=VALID_TICKET).status_code == 201


def test_core09_status_in_create_is_rejected(client):
    """CORE-09: sending status when creating a ticket gives 422 with its own message."""
    # Catches: the forbidden status field giving "Ogiltig indata." or English text.
    response = client.post("/tickets", json=ticket_with(status="closed"))
    assert_error(response, 422, STATUS_NOT_ALLOWED)


def test_core18_missing_title_and_too_long_description(client):
    """CORE-18: the spec's example, both messages joined by a space in field order."""
    # Catches: only the first message shown, or another separator than a space.
    body = ticket_with(title=None, description="a" * 2001)
    response = client.post("/tickets", json=body)
    assert_error(response, 422, f"{TITLE_REQUIRED} {DESCRIPTION_TOO_LONG}")


def test_core18_empty_body_object_lists_all_four_in_field_order(client):
    """CORE-18, B7 (field order title, description, category, priority, status): {} gives four messages."""
    # Catches: a missing category or priority translated wrongly, or the order changed.
    expected = " ".join([TITLE_REQUIRED, DESCRIPTION_REQUIRED, INVALID_CATEGORY, INVALID_PRIORITY])
    assert_error(client.post("/tickets", json={}), 422, expected)


def test_core18_all_five_errors_in_field_order_regardless_of_key_order(client):
    """CORE-18, B7: the order follows the fields, not the order of the keys in the body."""
    # Catches: messages sorted by the body's key order, or the order reversed.
    body = {
        "status": "closed",
        "priority": "akut",
        "category": "klagomål",
        "description": "a" * 2001,
        "title": "a" * 101,
    }
    expected = " ".join(
        [TITLE_TOO_LONG, DESCRIPTION_TOO_LONG, INVALID_CATEGORY, INVALID_PRIORITY, STATUS_NOT_ALLOWED]
    )
    assert_error(client.post("/tickets", json=body), 422, expected)


def test_core18_too_long_title_message(client):
    """CORE-18: a title of 101 characters (no whitespace, so no trimming involved)."""
    # Catches: no Swedish message for a too long title.
    response = client.post("/tickets", json=ticket_with(title="a" * 101))
    assert_error(response, 422, TITLE_TOO_LONG)


def test_core18_empty_string_title_is_required_message(client):
    """CORE-18: an empty string title gives the "required" message (no trimming involved)."""
    # Catches: a too short title not translated. Whitespace-only titles need trimming (KSP-22).
    response = client.post("/tickets", json=ticket_with(title=""))
    assert_error(response, 422, TITLE_REQUIRED)


def test_core18_unknown_category_and_priority(client):
    """CORE-18: unknown category and priority codes, in field order."""
    # Catches: unknown enum values not translated, or category and priority swapped.
    response = client.post("/tickets", json=ticket_with(category="klagomål", priority="akut"))
    assert_error(response, 422, f"{INVALID_CATEGORY} {INVALID_PRIORITY}")


# --- B. Only "Ogiltig indata." (CORE-17, B9) ---


def test_core17_wrong_type_gives_only_invalid_input(client):
    """CORE-17: a field with the wrong type ("title": 5) gives only "Ogiltig indata."."""
    # Catches: a wrong type giving a field message or FastAPI's English list.
    response = client.post("/tickets", json=ticket_with(title=5))
    assert_error(response, 422, INVALID_INPUT)


def test_core17_wrong_type_wins_over_missing_field(client):
    """CORE-17, B9 (wrong type hides the field messages): wrong title type and no description."""
    # Catches: the B9 rule removed, so "Beskrivning måste fyllas i." comes along.
    body = ticket_with(title=5, description=None)
    assert_error(client.post("/tickets", json=body), 422, INVALID_INPUT)


def test_core17_missing_body(client):
    """CORE-17: a request without a body gives "Ogiltig indata."."""
    # Catches: a missing body being read as a missing title, or English text.
    assert_error(client.post("/tickets"), 422, INVALID_INPUT)


def test_core17_broken_json(client):
    """CORE-17: broken JSON gives "Ogiltig indata."."""
    # Catches: FastAPI's English json_invalid error getting through.
    response = client.post("/tickets", content=b'{"title":', headers=JSON_HEADERS)
    assert_error(response, 422, INVALID_INPUT)


def test_core17_invalid_utf8_body(client):
    """CORE-17: a body with invalid UTF-8 gives 422 "Ogiltig indata.", not Starlette's English 400."""
    # Catches: no handler for Starlette's "There was an error parsing the body".
    response = client.post("/tickets", content=b'{"title": "\xff"}', headers=JSON_HEADERS)
    assert_error(response, 422, INVALID_INPUT)


def test_core17_body_that_is_not_an_object(client):
    """CORE-17: a JSON body that is a list instead of an object gives "Ogiltig indata."."""
    # Catches: a body of the wrong shape not translated.
    assert_error(client.post("/tickets", json=[1]), 422, INVALID_INPUT)


def test_core17_null_title_is_wrong_type(client):
    """CORE-17: "title": null is a wrong type (decided 2026-10-27), not a missing title."""
    # Catches: null being reported as "Rubrik måste fyllas i.".
    response = client.post("/tickets", json={**VALID_TICKET, "title": None})
    assert_error(response, 422, INVALID_INPUT)


def test_core17_unknown_field_gives_only_invalid_input(client):
    """CORE-17: an unknown field other than status gives only "Ogiltig indata." (decided 2026-10-27)."""
    # Catches: unknown fields giving field messages, or the status message.
    body = {**without("title"), "foo": 1}
    assert_error(client.post("/tickets", json=body), 422, INVALID_INPUT)


# --- C. Ids and paths (CORE-10, B8) ---


def test_core10_integer_id_passes_validation(client):
    """CORE-10 happy path: an integer id is not turned into a 404 by the error handler."""
    # Catches: every id error giving 404, also for valid ids. Since KSP-23 an existing
    # ticket is returned (200); before that, 501 from the stub showed the same thing.
    created = client.post("/tickets", json=VALID_TICKET).json()
    assert client.get(f"/tickets/{created['id']}").status_code == 200


@pytest.mark.parametrize("ticket_id", ["abc", "1.5", "-", "%20"])
def test_core10_non_integer_id_gives_404(client, ticket_id):
    """CORE-10, B8 (non-integer id is an unknown ticket): 404 "Ärendet finns inte."."""
    # Catches: a path validation error answering 422.
    assert_error(client.get(f"/tickets/{ticket_id}"), 404, TICKET_NOT_FOUND)


def test_core10_non_integer_id_wins_over_body_error(client):
    """CORE-10, B8: with both a bad id and a bad body, the ticket does not exist, so 404."""
    # Catches: the body error winning and giving 422.
    response = client.patch("/tickets/abc/status", json={"status": "klar"})
    assert_error(response, 404, TICKET_NOT_FOUND)


def test_unknown_path_gives_swedish_404(client):
    """CORE-16 (Swedish errors): a path that does not exist gives 404 "Sidan finns inte."."""
    # Catches: Starlette's "Not Found", or the ticket message used for every 404.
    assert_error(client.get("/tiketts"), 404, PAGE_NOT_FOUND)


def test_wrong_method_gives_swedish_405(client):
    """CORE-16 (Swedish errors): a method the path does not support gives 405 in Swedish."""
    # Catches: Starlette's "Method Not Allowed" getting through.
    assert_error(client.delete("/tickets/1"), 405, METHOD_NOT_ALLOWED)


# --- D. Format and 500 (CORE-16, HIST-14) ---


@pytest.fixture
def failing_client(database_url):
    """A client whose app has a route that fails on purpose. The route exists only here."""
    app = create_app(database_url)

    @app.get("/test-only/fail")
    def fail():
        # Looks like a database error, to show that no technical detail reaches the user.
        raise RuntimeError("SELECT * FROM tickets failed")

    # raise_server_exceptions=False returns the 500 response instead of re-raising in the test.
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client


def test_core16_unexpected_error_gives_swedish_500(failing_client):
    """CORE-16, HIST-14 (no stacktrace or SQL): an unexpected error gives a Swedish 500."""
    # Catches: no handler for Exception, so Starlette's plain text "Internal Server Error".
    response = failing_client.get("/test-only/fail")

    assert_error(response, 500, UNEXPECTED_ERROR)
    for leak in ["Traceback", "RuntimeError", "SELECT"]:
        assert leak not in response.text


def test_hist14_swedish_http_exception_passes_unchanged(client):
    """HIST-14 (same error format for status): an HTTPException with a Swedish detail is kept."""
    # Catches: the HTTPException handler overwriting every detail, e.g. with "Ogiltig indata.".
    # Since KSP-24 the router raises 404 "Ärendet finns inte." for an unknown ticket; before
    # that, 501 from the stub showed the same thing.
    response = client.patch("/tickets/999/status", json={"status": "in_progress"})
    assert_error(response, 404, TICKET_NOT_FOUND)


@pytest.mark.parametrize(
    "body",
    [{"status": 5}, None],
    ids=["wrong_type", "missing_body"],
)
def test_hist14_patch_wrong_type_gives_invalid_input(client, body):
    """HIST-14: a status change with a wrong type or no body gives only "Ogiltig indata."."""
    # Catches: the PATCH body falling outside the translation and returning English.
    response = client.patch("/tickets/1/status", json=body)
    assert_error(response, 422, INVALID_INPUT)


def test_hist06_missing_status_gives_invalid_status(client):
    """HIST-06 (unknown or missing status): a body without status gives "Välj en giltig status."."""
    # Catches: a missing status read as a broken request (B9) and answered "Ogiltig indata.".
    # A request with no body at all is still broken input, see the missing_body case above.
    response = client.patch("/tickets/1/status", json={})
    assert_error(response, 422, INVALID_STATUS)


# (method, url, keyword arguments) for every error case above that uses the normal client.
ERROR_CASES = [
    ("post", "/tickets", {"json": ticket_with(status="closed")}),
    ("post", "/tickets", {"json": ticket_with(title=None, description="a" * 2001)}),
    ("post", "/tickets", {"json": {}}),
    ("post", "/tickets", {"json": {"status": "closed", "priority": "akut", "category": "klagomål"}}),
    ("post", "/tickets", {"json": ticket_with(title="a" * 101)}),
    ("post", "/tickets", {"json": ticket_with(title="")}),
    ("post", "/tickets", {"json": ticket_with(title=5)}),
    ("post", "/tickets", {}),
    ("post", "/tickets", {"content": b'{"title":', "headers": JSON_HEADERS}),
    ("post", "/tickets", {"content": b'{"title": "\xff"}', "headers": JSON_HEADERS}),
    ("post", "/tickets", {"json": [1]}),
    ("post", "/tickets", {"json": {**VALID_TICKET, "title": None}}),
    ("post", "/tickets", {"json": {**without("title"), "foo": 1}}),
    ("get", "/tickets/abc", {}),
    ("patch", "/tickets/abc/status", {"json": {"status": "klar"}}),
    ("patch", "/tickets/1/status", {"json": {"status": 5}}),
    ("patch", "/tickets/1/status", {"json": {}}),
    ("get", "/tiketts", {}),
    ("delete", "/tickets/1", {}),
]


@pytest.mark.parametrize("method, url, kwargs", ERROR_CASES)
def test_core16_every_error_has_only_a_swedish_detail(client, method, url, kwargs):
    """CORE-16, HIST-14: every error is JSON with only "detail", and no English leaks through."""
    # Catches: any English default error or English field name in one of the cases.
    response = client.request(method, url, **kwargs)

    assert response.status_code >= 400
    assert response.headers["content-type"] == "application/json"
    body = response.json()
    assert list(body) == ["detail"]
    assert isinstance(body["detail"], str)
    for text in FORBIDDEN_IN_DETAIL:
        assert text not in body["detail"]
