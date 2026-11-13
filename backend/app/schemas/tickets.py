"""Pydantic models for tickets and their history (KSP-20).

These models are the API contract: FastAPI turns them into /openapi.json, and the
frontend generates its TypeScript types from that schema (KSP-28). Field rules such as
lengths and enums live here so that they are visible in the schema
(API conventions, section 6).

Specs: CORE section 4 (tickets), HIST sections 4-5 (status change and history).
"""

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator

# B10: invisible zero-width characters that str.strip() keeps but are trimmed anyway,
# since a title that looks empty to the user should count as empty (CORE-11).
ZERO_WIDTH_CHARS = "​‌‍⁠﻿"

# Fixed UTC format with microseconds always present, so that sorting as text works
# (HIST assumption 3, HIST-11). Kept as str because Pydantic's datetime drops zero
# microseconds. The service formats the value (KSP-20 decision 1).
TIMESTAMP_PATTERN = r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$"


# StrEnum values are plain strings, so the schema gets "enum": [...] and the frontend
# gets a union type like "billing" | "delivery" instead of string.
class Category(StrEnum):
    """Ticket category (CORE B2)."""

    BILLING = "billing"
    DELIVERY = "delivery"
    TECHNICAL = "technical"
    ACCOUNT = "account"
    OTHER = "other"


class Priority(StrEnum):
    """Ticket priority (CORE B3)."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Status(StrEnum):
    """Ticket status (HIST assumption 2). Changed only via PATCH /tickets/{id}/status."""

    NEW = "new"
    IN_PROGRESS = "in_progress"
    WAITING_ON_CUSTOMER = "waiting_on_customer"
    CLOSED = "closed"


class EventType(StrEnum):
    """Kind of history entry (HIST section 4, KSP-20 decision 3)."""

    # New types (e.g. notes, assignment) are added here when they are specified.
    CREATED = "created"
    STATUS_CHANGED = "status_changed"


class TicketCreate(BaseModel):
    """Request body for POST /tickets."""

    # Unknown fields, including status, are rejected: the server always sets status
    # to "new" (CORE-09). In the schema this becomes additionalProperties: false.
    model_config = ConfigDict(extra="forbid")

    # Length limits in characters (code points), from CORE-12 and CORE-13. They are
    # checked after the trimming below, since a "before" validator runs first.
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=2000)
    category: Category
    priority: Priority

    @field_validator("title", "description", mode="before")
    @classmethod
    def trim_ends(cls, value):
        """CORE-05, B10, B12: trim whitespace and zero-width characters at the ends only.

        Characters inside the text are kept and counted, and the text is not normalised
        (B12), so the saved text is exactly the text that was counted. A value that is not
        a string is left alone, so it still fails as a wrong type ("Ogiltig indata.", B9).
        """
        if not isinstance(value, str):
            return value
        # Repeat until nothing changes, since the two kinds can be mixed, e.g. " ​ ".
        previous = None
        while value != previous:
            previous = value
            value = value.strip().strip(ZERO_WIDTH_CHARS)
        return value


class Ticket(BaseModel):
    """A ticket as returned by the API (CORE section 4)."""

    id: int
    title: str
    description: str
    category: Category
    priority: Priority
    status: Status
    # Set by the server when the ticket is created.
    created_at: str = Field(pattern=TIMESTAMP_PATTERN)


class StatusChange(BaseModel):
    """Request body for PATCH /tickets/{ticket_id}/status (HIST section 5)."""

    # Only the status can be changed here. Other fields, e.g. a title, are rejected with
    # "Ogiltig indata." like unknown fields in POST, so a client never believes they were
    # saved (decided in PR #43). In the schema this becomes additionalProperties: false.
    model_config = ConfigDict(extra="forbid")

    status: Status


class HistoryEntry(BaseModel):
    """One entry in a ticket's history (HIST section 4). Entries are never changed."""

    id: int
    event_type: EventType
    # None only for the "created" entry, since there is no previous status.
    from_status: Status | None
    to_status: Status
    occurred_at: str = Field(pattern=TIMESTAMP_PATTERN)


class ErrorResponse(BaseModel):
    """Every error body: {"detail": "<Swedish message>"} (API conventions, section 2)."""

    detail: str
