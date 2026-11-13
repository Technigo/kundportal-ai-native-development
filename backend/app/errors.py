"""Error handlers that give every API error the form {"detail": "<Swedish message>"} (KSP-21).

FastAPI and Starlette answer errors with English defaults: a list of objects for
validation errors, "Not Found", "Method Not Allowed", a 400 for a body that cannot be
parsed and plain text for crashes. The handlers here translate those into the error
format from the API conventions (section 2) and CORE section 4.

Requirements: CORE-16 and HIST-14 (Swedish {"detail": ...}, no stacktrace, SQL or English
field names), CORE-17 and B9 (a broken request gives only "Ogiltig indata."), CORE-18 and B7
(several field errors joined in field order), CORE-10 and B8 (a non-integer id is an unknown
ticket, 404).
"""

from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

# Messages from CORE section 4, HIST-06 and the KSP-21 assignment (500, 404 path, 405).
TITLE_REQUIRED = "Rubrik måste fyllas i."
TITLE_TOO_LONG = "Rubriken får vara högst 100 tecken."
DESCRIPTION_REQUIRED = "Beskrivning måste fyllas i."
DESCRIPTION_TOO_LONG = "Beskrivningen får vara högst 2000 tecken."
INVALID_CATEGORY = "Välj en giltig kategori."
INVALID_PRIORITY = "Välj en giltig prioritet."
STATUS_NOT_ALLOWED = "Status sätts automatiskt och kan inte anges när ett ärende skapas."
INVALID_STATUS = "Välj en giltig status."
# HIST-07: the ticket already has the status that was sent (raised by the router, KSP-24).
SAME_STATUS = "Ärendet har redan den statusen."
# HIST-09: the history entry could not be saved, so the change was rolled back (503, KSP-36).
STATUS_NOT_CHANGED = "Statusen kunde inte ändras. Försök igen."
INVALID_INPUT = "Ogiltig indata."
TICKET_NOT_FOUND = "Ärendet finns inte."
PAGE_NOT_FOUND = "Sidan finns inte."
METHOD_NOT_ALLOWED = "Metoden stöds inte."
UNEXPECTED_ERROR = "Något gick fel. Försök igen."

# B7: messages are shown in this field order, whatever order the client sent the keys in.
FIELD_ORDER = ["title", "description", "category", "priority", "status"]

# (field, pydantic error type) -> message. Only these errors get a field message.
# Any other error (wrong type, unknown field, broken JSON, missing body) means the request
# itself is broken, and the whole answer becomes "Ogiltig indata." (B9).
FIELD_MESSAGES = {
    ("title", "missing"): TITLE_REQUIRED,
    # An empty string. Whitespace-only titles need trimming, which is built in KSP-22.
    ("title", "string_too_short"): TITLE_REQUIRED,
    ("title", "string_too_long"): TITLE_TOO_LONG,
    ("description", "missing"): DESCRIPTION_REQUIRED,
    ("description", "string_too_short"): DESCRIPTION_REQUIRED,
    ("description", "string_too_long"): DESCRIPTION_TOO_LONG,
    # Missing and unknown codes share a message (CORE section 4).
    ("category", "missing"): INVALID_CATEGORY,
    ("category", "enum"): INVALID_CATEGORY,
    ("priority", "missing"): INVALID_PRIORITY,
    ("priority", "enum"): INVALID_PRIORITY,
    # POST /tickets forbids status (CORE-09). Other unknown fields are not listed, so they
    # give "Ogiltig indata." (decided 2026-10-27).
    ("status", "extra_forbidden"): STATUS_NOT_ALLOWED,
    # PATCH /tickets/{id}/status with an unknown or missing status code (HIST-06, HIST
    # section 5). A request with no body at all is still broken input (B9).
    ("status", "enum"): INVALID_STATUS,
    ("status", "missing"): INVALID_STATUS,
}

# Starlette's own errors that carry an English default text, by status code.
HTTP_MESSAGES = {
    HTTPStatus.NOT_FOUND: PAGE_NOT_FOUND,
    HTTPStatus.METHOD_NOT_ALLOWED: METHOD_NOT_ALLOWED,
}


def _error(status_code: int, detail: str, headers: dict | None = None) -> JSONResponse:
    """The one error body used by every handler."""
    return JSONResponse({"detail": detail}, status_code=status_code, headers=headers)


def _field_message(error: dict) -> str | None:
    """The Swedish message for one body field error, or None if it has no field message."""
    loc = error["loc"]
    # Field errors look like ("body", "title"). Anything else, e.g. ("body",) for a missing
    # body or ("body", 9) for broken JSON, is not about a single field.
    if len(loc) != 2 or loc[0] != "body":
        return None
    # Pydantic reports {"status": 5} with the same "enum" type as {"status": "klar"}.
    # A code that is not a string is a wrong type, so it gets no field message (HIST-06, B9).
    if error["type"] == "enum" and not isinstance(error.get("input"), str):
        return None
    return FIELD_MESSAGES.get((loc[1], error["type"]))


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Translate FastAPI's English list of validation errors to one Swedish detail."""
    errors = exc.errors()

    # B8: the only path parameter is ticket_id, and an id that is not an integer is treated
    # as an unknown ticket. It wins over body errors, since the ticket does not exist anyway.
    if any(error["loc"][0] == "path" for error in errors):
        return _error(HTTPStatus.NOT_FOUND, TICKET_NOT_FOUND)

    messages = {}
    for error in errors:
        message = _field_message(error)
        if message is None:
            # B9: one broken part makes the whole request invalid, without field messages.
            return _error(HTTPStatus.UNPROCESSABLE_ENTITY, INVALID_INPUT)
        messages[error["loc"][1]] = message

    # CORE-18: all messages, joined by a space, in field order (B7).
    detail = " ".join(messages[field] for field in FIELD_ORDER if field in messages)
    return _error(HTTPStatus.UNPROCESSABLE_ENTITY, detail)


async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Translate Starlette's English HTTP errors. Errors with our own detail pass unchanged."""
    # FastAPI raises 400 "There was an error parsing the body" for a body it cannot read,
    # e.g. invalid UTF-8. The app never raises 400 itself, so all 400s are broken input (CORE-17).
    if exc.status_code == HTTPStatus.BAD_REQUEST:
        return _error(HTTPStatus.UNPROCESSABLE_ENTITY, INVALID_INPUT)

    # Starlette raises 404 and 405 without a detail, so the detail is the English status
    # phrase. A 404 raised by our code has a Swedish detail ("Ärendet finns inte.") and is kept.
    detail = exc.detail
    if exc.status_code in HTTP_MESSAGES and detail == HTTPStatus(exc.status_code).phrase:
        detail = HTTP_MESSAGES[exc.status_code]

    # Headers are kept, e.g. Allow on a 405.
    return _error(exc.status_code, detail, getattr(exc, "headers", None))


async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Answer any unhandled error with a Swedish 500 and no technical details (CORE-16, HIST-14)."""
    # Starlette still re-raises the error after this response, so the server log keeps the
    # traceback for the developer while the client only sees the message.
    return _error(HTTPStatus.INTERNAL_SERVER_ERROR, UNEXPECTED_ERROR)


def register_error_handlers(app: FastAPI) -> None:
    """Install the handlers on the app. Called from create_app."""
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    # Registered on Starlette's class so that it also catches the router's 404 and 405.
    app.add_exception_handler(StarletteHTTPException, http_error_handler)
    app.add_exception_handler(Exception, unexpected_error_handler)
