"""CORE rules for creating a ticket that test_create_ticket.py (KSP-22) does not cover.

Covers CORE-12 (title max 100 characters), CORE-13 (description max 2000 characters),
CORE-11 for the description (a description of only whitespace or any of the five zero-width
characters is empty), CORE-11 with mixed whitespace and zero-width characters, how length
is counted (CORE-12, CORE-13, B10 trimming, B11 code points), and that nothing is saved when
CORE-13, CORE-17 (wrong type gives "Ogiltig indata.") or CORE-18 (several errors at once, in
field order) reject the ticket. Part of KSP-26 (CORE tests: validation and edge cases).

Like test_create_ticket.py, the tests read the SQLite file directly, so that they see what
was really saved. Test proposals reviewed by Nicklas 2026-10-28 (v2-nicklas).
"""

import sqlite3

import pytest

# Messages from CORE section 4. Tests compare exact text.
TITLE_REQUIRED = "Rubrik måste fyllas i."
TITLE_TOO_LONG = "Rubriken får vara högst 100 tecken."
DESCRIPTION_REQUIRED = "Beskrivning måste fyllas i."
DESCRIPTION_TOO_LONG = "Beskrivningen får vara högst 2000 tecken."
INVALID_INPUT = "Ogiltig indata."

ZERO_WIDTH_SPACE = "\u200b"
# B10: all five zero-width characters that are trimmed, not only U+200B (found in KSP-44, N3).
ZERO_WIDTH_CHARS = ["\u200b", "\u200c", "\u200d", "\u2060", "\ufeff"]
CATEGORY_INVALID = "V\u00e4lj en giltig kategori."

# A valid body (made-up data), so that only the field under test changes.
VALID_TICKET = {
    "title": "Fakturan har fel belopp",
    "description": "Kunden har fått dubbel debitering för oktober.",
    "category": "billing",
    "priority": "high",
}


def ticket_with(**changes):
    """VALID_TICKET with some fields replaced, or removed when the value is None."""
    body = {**VALID_TICKET, **changes}
    return {key: value for key, value in body.items() if value is not None}


def saved_tickets(database_url):
    """All rows in the tickets table, read straight from the SQLite file."""
    path = database_url.removeprefix("sqlite:///")
    with sqlite3.connect(path) as connection:
        connection.row_factory = sqlite3.Row
        return [dict(row) for row in connection.execute("SELECT * FROM tickets")]


# --- Title length (CORE-12) ---


@pytest.mark.parametrize("length", [99, 100], ids=["99_chars", "100_chars"])
def test_core12_title_up_to_100_is_accepted(client, database_url, length):
    """CORE-12 (title max 100 characters): 99 and 100 are accepted and saved."""
    # Catches: the limit moved from "at most 100" to "less than 100" (KSP-44, N4).
    title = "a" * length
    response = client.post("/tickets", json=ticket_with(title=title))

    assert response.status_code == 201
    assert saved_tickets(database_url)[0]["title"] == title


def test_core12_title_101_is_rejected(client, database_url):
    """CORE-12: 101 characters gives 422 "Rubriken får vara högst 100 tecken."."""
    # Catches: the limit moved to 101, or no limit on the title at all.
    response = client.post("/tickets", json=ticket_with(title="a" * 101))

    assert response.status_code == 422
    assert response.json() == {"detail": TITLE_TOO_LONG}
    assert saved_tickets(database_url) == []


# --- Description length (CORE-13) ---


@pytest.mark.parametrize("length", [1999, 2000], ids=["1999_chars", "2000_chars"])
def test_core13_description_up_to_2000_is_accepted(client, database_url, length):
    """CORE-13 (description max 2000 characters): 1999 and 2000 are accepted and saved."""
    # Catches: the limit moved from "at most 2000" to "less than 2000".
    description = "b" * length
    response = client.post("/tickets", json=ticket_with(description=description))

    assert response.status_code == 201
    assert saved_tickets(database_url)[0]["description"] == description


def test_core13_description_2001_is_rejected(client, database_url):
    """CORE-13: 2001 characters gives 422 "Beskrivningen får vara högst 2000 tecken."."""
    # Catches: the limit moved to 2001, or no limit on the description at all.
    response = client.post("/tickets", json=ticket_with(description="b" * 2001))

    assert response.status_code == 422
    assert response.json() == {"detail": DESCRIPTION_TOO_LONG}
    assert saved_tickets(database_url) == []


# --- Empty after trimming (CORE-11, B10) ---


@pytest.mark.parametrize(
    "description",
    ["   ", "\t\n", *ZERO_WIDTH_CHARS],
    ids=["spaces", "tab_newline", "u200b", "u200c", "u200d", "u2060", "ufeff"],
)
def test_core11_blank_description_is_required(client, database_url, description):
    """CORE-11 (only whitespace counts as empty) for the description, not only the title."""
    # Catches: trimming that is only done on the title.
    response = client.post("/tickets", json=ticket_with(description=description))

    assert response.status_code == 422
    assert response.json() == {"detail": DESCRIPTION_REQUIRED}
    assert saved_tickets(database_url) == []


def test_core11_mixed_whitespace_and_zero_width_is_empty(client, database_url):
    """CORE-11, B10: spaces and zero-width spaces taking turns still count as empty."""
    # Catches: trimming in one pass only (strip() once, then zero-width characters once),
    # which leaves " " between two U+200B.
    title = f" {ZERO_WIDTH_SPACE} {ZERO_WIDTH_SPACE} "
    response = client.post("/tickets", json=ticket_with(title=title))

    assert response.status_code == 422
    assert response.json() == {"detail": TITLE_REQUIRED}
    assert saved_tickets(database_url) == []


# --- How length is counted (CORE-12, CORE-13, B10, B11) ---


@pytest.mark.parametrize(
    ("field", "text"),
    [
        ("title", ZERO_WIDTH_SPACE + "a" * 100),
        ("title", "å" * 100),
        ("title", "a" * 99 + "😊"),
        ("title", "a" * 98 + "🇸🇪"),
        ("description", "b" * 2000 + "  "),
        ("description", "å" * 1999 + "😊"),
    ],
    ids=[
        "title_zero_width_trimmed_before_count",
        "title_100_a_ring",
        "title_99_plus_emoji",
        "title_98_plus_flag",
        "description_2000_plus_spaces",
        "description_1999_a_ring_plus_emoji",
    ],
)
def test_length_is_counted_in_code_points_after_trimming(client, database_url, field, text):
    """CORE-12, CORE-13, B10, B11: length is code points, counted after trimming.

    Each text is exactly at the limit when counted the right way, and over it when counted
    as bytes (å is 2 bytes), UTF-16 units (😊 is 2, 🇸🇪 is 4) or before trimming.
    """
    # Catches: counting bytes, UTF-16 units, or before trimming. Reading the saved row back
    # also catches a ticket that is not saved, or saved untrimmed (KSP-44, N7).
    response = client.post("/tickets", json=ticket_with(**{field: text}))

    assert response.status_code == 201, response.text
    limit = 100 if field == "title" else 2000
    assert len(saved_tickets(database_url)[0][field]) == limit


def test_b11_joined_emoji_counts_as_its_code_points(client, database_url):
    """B11 (joined emoji count as their code points): 98 + 👩\u200d💻 (3 code points) is 101."""
    # Catches: counting what the user sees (grapheme clusters), which would make it 99.
    response = client.post("/tickets", json=ticket_with(title="a" * 98 + "👩\u200d💻"))

    assert response.status_code == 422
    assert response.json() == {"detail": TITLE_TOO_LONG}
    assert saved_tickets(database_url) == []


# --- Nothing saved on 422 (CORE-17, CORE-18) ---


@pytest.mark.parametrize(
    ("body", "detail"),
    [
        (ticket_with(title=5), INVALID_INPUT),
        # B9: a wrong type together with a missing field gives only "Ogiltig indata.".
        ({"title": None, "category": "billing", "priority": "high"}, INVALID_INPUT),
        (ticket_with(title=None, description="b" * 2001), f"{TITLE_REQUIRED} {DESCRIPTION_TOO_LONG}"),
        # B7: field order, not the order of the keys in the body (KSP-44, N6).
        (
            {"priority": "high", "category": "x", "description": "b" * 2001, "title": " "},
            f"{TITLE_REQUIRED} {DESCRIPTION_TOO_LONG} {CATEGORY_INVALID}",
        ),
    ],
    ids=[
        "core17_title_is_number",
        "core17_null_title_and_missing_description",
        "core18_two_errors",
        "core18_three_errors_keys_reversed",
    ],
)
def test_rejected_ticket_saves_nothing(client, database_url, body, detail):
    """CORE-17 (wrong type) and CORE-18 (several errors, joined in field order): nothing is saved."""
    # Catches: the service saving before validation has run.
    response = client.post("/tickets", json=body)

    assert response.status_code == 422
    assert response.json() == {"detail": detail}
    assert saved_tickets(database_url) == []
