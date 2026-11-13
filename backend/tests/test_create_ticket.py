"""KSP-22: creating a ticket with POST /tickets, and what ends up in the database.

Covers CORE-01 (a valid ticket gives 201 with status "new"), CORE-05 with B10 and B12
(title and description are trimmed at the ends only, also zero-width characters),
CORE-11 (a title of only whitespace is empty), CORE-12 (max 100 characters, counted after
trimming), CORE-14 (text is stored unchanged, no Unicode normalisation) and AC5 in KSP-22
(nothing is saved when the request is rejected with 422).

The tests read the SQLite file directly with sqlite3, so that they see what was really
saved and not only what the API answered. GET /tickets/{id} (CORE-04) is built in KSP-23.
The history entry "created" (HIST-01) is tested in KSP-34 and KSP-39.
Test proposals: docs/ai/testforslag-v1.md, reviewed by Azalea 2026-10-27.
"""

import re
import sqlite3

import pytest

# Messages from CORE section 4. Tests compare exact text.
TITLE_REQUIRED = "Rubrik måste fyllas i."
TITLE_TOO_LONG = "Rubriken får vara högst 100 tecken."

# API conventions section 3: UTC, always with microseconds, so that text sorting is correct.
TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$")

# B10: the zero-width characters that are trimmed together with whitespace.
ZERO_WIDTH = ["​", "‌", "‍", "⁠", "﻿"]

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


# --- Create and save (CORE-01) ---


def test_core01_valid_ticket_gets_201_and_status_new(client):
    """CORE-01 (valid ticket gives 201 and status "new"): the answer is the created ticket."""
    # Catches: a status other than "new", 200 instead of 201, or a time without microseconds.
    response = client.post("/tickets", json=VALID_TICKET)

    assert response.status_code == 201
    ticket = response.json()
    assert isinstance(ticket["id"], int)
    assert {key: ticket[key] for key in VALID_TICKET} == VALID_TICKET
    assert ticket["status"] == "new"
    assert TIMESTAMP.match(ticket["created_at"])


def test_core01_created_ticket_is_saved(client, database_url):
    """CORE-01 (valid ticket is created): exactly one row with the same data is saved.

    CORE-01 only says that the API answers 201 with the ticket. That the ticket is also
    saved follows from CORE-02 (kept after restart) and CORE-04 (read back unchanged).
    Nicklas is asked to add "och ärendet sparas" to CORE-01 (Azalea 2026-10-27).
    """
    # Catches: commit() removed in the service, so the answer looks right but nothing is saved.
    response = client.post("/tickets", json=VALID_TICKET)

    assert response.status_code == 201
    assert saved_tickets(database_url) == [response.json()]


# --- Trimming at the ends only (CORE-05, B10, B12) ---


def test_core05_title_and_description_are_trimmed(client, database_url):
    """CORE-05, B10 (trim whitespace and zero-width characters): the ends are removed."""
    # Catches: no trimming, or plain strip() that leaves U+200B in place.
    body = ticket_with(
        title="  Fakturan har fel belopp\t",
        description="​Kunden har fått dubbel debitering för oktober.​",
    )
    response = client.post("/tickets", json=body)

    assert response.status_code == 201
    created = response.json()
    assert created["title"] == VALID_TICKET["title"]
    assert created["description"] == VALID_TICKET["description"]
    [saved] = saved_tickets(database_url)
    assert saved["title"] == VALID_TICKET["title"]
    assert saved["description"] == VALID_TICKET["description"]


@pytest.mark.parametrize("char", ZERO_WIDTH, ids=[f"U+{ord(c):04X}" for c in ZERO_WIDTH])
def test_core05_each_zero_width_char_is_trimmed(client, char):
    """CORE-05, B10: each of the five zero-width characters is trimmed at both ends."""
    # Catches: one of the five characters missing from the trimming.
    response = client.post("/tickets", json=ticket_with(title=f"{char}Fakturan{char}"))

    assert response.status_code == 201
    assert response.json()["title"] == "Fakturan"


def test_core05_inner_characters_are_kept(client, database_url):
    """CORE-05, B12 (only the ends are trimmed): characters inside the text are kept."""
    # Catches: trimming that also removes characters inside, e.g. replace() instead of trim.
    title = "Åtgärd  för​ärende"
    response = client.post("/tickets", json=ticket_with(title=title))

    assert response.status_code == 201
    assert response.json()["title"] == title
    assert saved_tickets(database_url)[0]["title"] == title


@pytest.mark.parametrize(
    "title",
    ["Åtgärd för ärende 😊", "Café"],
    ids=["emoji", "decomposed_e_acute"],
)
def test_core14_text_is_not_normalized(client, database_url, title):
    """CORE-14, B12 (no Unicode normalisation): the text is stored with the same code points."""
    # Catches: unicodedata.normalize("NFC", ...) added, which turns "e" + U+0301 into "é".
    response = client.post("/tickets", json=ticket_with(title=title))

    assert response.status_code == 201
    assert response.json()["title"] == title
    assert saved_tickets(database_url)[0]["title"] == title


# --- Empty and too long after trimming (CORE-11, CORE-12) ---


@pytest.mark.parametrize(
    "title",
    ["   ", "\t\n", "​"],
    ids=["spaces", "tab_newline", "zero_width_space"],
)
def test_core11_whitespace_only_title_is_required(client, database_url, title):
    """CORE-11, B10 (only whitespace counts as empty): 422 "Rubrik måste fyllas i."."""
    # Catches: no trimming, or zero-width characters missing from the trimming.
    response = client.post("/tickets", json=ticket_with(title=title))

    assert response.status_code == 422
    assert response.json() == {"detail": TITLE_REQUIRED}
    assert saved_tickets(database_url) == []


def test_core12_100_chars_after_trim_is_accepted(client):
    """CORE-12 (max 100, counted after trimming): 100 characters with a space around are accepted."""
    # Catches: the length checked before trimming (Nicklas' finding in PR #26).
    response = client.post("/tickets", json=ticket_with(title=" " + "a" * 100 + " "))

    assert response.status_code == 201
    assert response.json()["title"] == "a" * 100


@pytest.mark.parametrize(
    "title",
    ["a" * 101, "a" * 99 + "​" + "a"],
    ids=["101_chars", "inner_zero_width_counts"],
)
def test_core12_101_chars_after_trim_is_rejected(client, database_url, title):
    """CORE-12, B12 (inner zero-width characters are kept and counted): 101 gives 422."""
    # Catches: the limit moved to 101, or inner zero-width characters removed before counting.
    response = client.post("/tickets", json=ticket_with(title=title))

    assert response.status_code == 422
    assert response.json() == {"detail": TITLE_TOO_LONG}
    assert saved_tickets(database_url) == []


# --- Nothing saved on 422 (CORE-06 to CORE-09, AC5 in KSP-22) ---


@pytest.mark.parametrize(
    "body",
    [
        ticket_with(title=None),
        ticket_with(description=None),
        ticket_with(category="klagomål"),
        ticket_with(status="closed"),
    ],
    ids=["core06_missing_title", "core07_missing_description", "core08_unknown_category", "core09_status_sent"],
)
def test_ksp22_nothing_saved_on_422(client, database_url, body):
    """CORE-06 to CORE-09 (rejected tickets) and AC5 in KSP-22: a 422 leaves the table empty.

    The messages themselves are tested in test_error_format.py (KSP-21).
    """
    # Catches: the service saving before validation has run.
    response = client.post("/tickets", json=body)

    assert response.status_code == 422
    assert saved_tickets(database_url) == []
