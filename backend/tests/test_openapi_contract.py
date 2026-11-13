"""KSP-20: the API contract for CORE and HIST in /openapi.json, before any logic exists.

The frontend generates its types from this schema (KSP-28), so these tests check the
shape of requests, responses and errors, not behaviour. Behaviour is tested per
requirement id (CORE-xx, HIST-xx) when each endpoint is built.

The 501 tests for the stubs were temporary and are gone: the last one was removed in KSP-24,
when PATCH /tickets/{id}/status was built. Behaviour is tested in test_create_ticket.py,
test_core_read.py, test_read_history.py, test_history.py and test_status_rules.py.
"""

import re

import pytest

# (method, path as written in the schema, success status code)
ENDPOINTS = [
    ("post", "/tickets", "201"),
    ("get", "/tickets", "200"),
    ("get", "/tickets/{ticket_id}", "200"),
    ("patch", "/tickets/{ticket_id}/status", "200"),
    ("get", "/tickets/{ticket_id}/history", "200"),
]

# (method, path, success status, model, whether the response is a list of the model)
SUCCESS_RESPONSES = [
    ("post", "/tickets", "201", "Ticket", False),
    ("get", "/tickets", "200", "Ticket", True),
    ("get", "/tickets/{ticket_id}", "200", "Ticket", False),
    ("patch", "/tickets/{ticket_id}/status", "200", "Ticket", False),
    ("get", "/tickets/{ticket_id}/history", "200", "HistoryEntry", True),
]

# (method, path, error code) that must be declared with {"detail": string}
DECLARED_ERRORS = [
    ("post", "/tickets", "422"),
    ("get", "/tickets/{ticket_id}", "404"),
    ("patch", "/tickets/{ticket_id}/status", "404"),
    ("patch", "/tickets/{ticket_id}/status", "409"),
    ("patch", "/tickets/{ticket_id}/status", "422"),
    ("patch", "/tickets/{ticket_id}/status", "503"),
    ("get", "/tickets/{ticket_id}/history", "404"),
]

# The four statuses in spec order (HIST assumption 2), used by several tests.
STATUSES = ["new", "in_progress", "waiting_on_customer", "closed"]


@pytest.fixture
def openapi(client):
    # The generated schema, the same file the frontend builds its types from.
    return client.get("/openapi.json").json()


def resolve(openapi, schema):
    """Follow a $ref like '#/components/schemas/Ticket' to the schema it points to."""
    # A model is stored once under components and referenced elsewhere by $ref.
    while "$ref" in schema:
        name = schema["$ref"].rsplit("/", 1)[-1]
        schema = openapi["components"]["schemas"][name]
    return schema


def ref_name(schema):
    """Name of the model a $ref points to, e.g. 'Ticket'."""
    return schema["$ref"].rsplit("/", 1)[-1]


def component(openapi, name):
    """A model's schema by name, e.g. component(openapi, 'Ticket')."""
    return openapi["components"]["schemas"][name]


def enum_values(openapi, schema):
    """Enum values of a field, also when the field is nullable (anyOf with null)."""
    # A nullable field is anyOf [<enum>, null], so look in each option.
    for option in schema.get("anyOf", [schema]):
        resolved = resolve(openapi, option)
        if "enum" in resolved:
            return resolved["enum"]
    raise AssertionError(f"No enum in {schema}")


def response_schema(openapi, method, path, status):
    """The JSON body schema for one response code of one endpoint."""
    response = openapi["paths"][path][method]["responses"][status]
    return response["content"]["application/json"]["schema"]


@pytest.mark.parametrize("method, path, success", ENDPOINTS)
def test_endpoint_is_in_contract_with_success_status(openapi, method, path, success):
    """CORE section 4, HIST section 5, CORE-01: every endpoint exists with its success code."""
    # Catches: a missing endpoint, or POST answering 200 instead of 201.
    assert method in openapi["paths"].get(path, {}), f"{method.upper()} {path} is missing"
    assert success in openapi["paths"][path][method]["responses"]


@pytest.mark.parametrize("method, path, success, model, is_list", SUCCESS_RESPONSES)
def test_success_response_has_the_right_model(openapi, method, path, success, model, is_list):
    """CORE section 4, HIST section 5: the success body is a Ticket, or a list of them."""
    # Catches: GET /tickets returning one ticket instead of a list, or the history
    # returning tickets, which would give the frontend the wrong generated types.
    schema = response_schema(openapi, method, path, success)

    if is_list:
        assert schema["type"] == "array"
        schema = schema["items"]
    assert ref_name(schema) == model


def test_ticket_id_is_an_integer_path_parameter(openapi):
    """KSP-20 decision 2: ticket_id is an integer in the contract."""
    # Catches: ticket_id typed as a string, which gives the frontend the wrong type.
    # 404 for "abc" (CORE-10, B8) is error handling and belongs to KSP-21.
    for path in ["/tickets/{ticket_id}", "/tickets/{ticket_id}/status", "/tickets/{ticket_id}/history"]:
        for operation in openapi["paths"][path].values():
            (param,) = [p for p in operation["parameters"] if p["name"] == "ticket_id"]
            assert param["schema"]["type"] == "integer"


def test_ticket_has_all_fields_from_spec(openapi):
    """CORE section 4: a ticket in a response has exactly these fields, all present."""
    # Catches: a field missing from the response model (e.g. created_at or status),
    # which would silently disappear from the frontend types.
    schema = component(openapi, "Ticket")
    fields = {"id", "title", "description", "category", "priority", "status", "created_at"}

    assert set(schema["properties"]) == fields
    assert set(schema["required"]) == fields


def test_category_priority_and_status_enums_match_specs(openapi):
    """CORE B2, CORE B3, HIST assumption 2: the enum values."""
    # Catches: enum values that differ from the specs.
    ticket = component(openapi, "Ticket")["properties"]

    assert enum_values(openapi, ticket["category"]) == ["billing", "delivery", "technical", "account", "other"]
    assert enum_values(openapi, ticket["priority"]) == ["low", "medium", "high"]
    assert enum_values(openapi, ticket["status"]) == STATUSES


def test_ticket_create_has_length_limits_and_no_status(openapi):
    """CORE-09, CORE-12, CORE-13: length limits, no status, no unknown fields."""
    # Catches: missing length limits, a status field that lets the client set the
    # status, or unknown fields being accepted.
    schema = component(openapi, "TicketCreate")
    fields = schema["properties"]

    assert set(fields) == {"title", "description", "category", "priority"}
    assert set(schema["required"]) == {"title", "description", "category", "priority"}
    assert (fields["title"]["minLength"], fields["title"]["maxLength"]) == (1, 100)
    assert (fields["description"]["minLength"], fields["description"]["maxLength"]) == (1, 2000)
    assert schema["additionalProperties"] is False


def test_status_change_body_takes_only_a_valid_status(openapi):
    """HIST section 5: the PATCH body is {"status": <status>} and nothing else.

    Other fields, e.g. {"status": "closed", "title": "x"}, are rejected with "Ogiltig
    indata.", the same as unknown fields in POST (decided in PR #43, 2026-10-29).
    """
    # Catches: a PATCH body without the status enum, or other fields being ignored, so a
    # client could believe that the title was changed when it was not.
    operation = openapi["paths"]["/tickets/{ticket_id}/status"]["patch"]
    body = resolve(openapi, operation["requestBody"]["content"]["application/json"]["schema"])

    assert set(body["properties"]) == {"status"}
    assert body["required"] == ["status"]
    assert enum_values(openapi, body["properties"]["status"]) == STATUSES
    assert body["additionalProperties"] is False


def test_history_entry_fields_match_spec(openapi):
    """HIST section 4, KSP-20 decision 3: entry fields, event_type enum, nullable from_status."""
    # Catches: a history entry shape that differs from the spec, or a from_status that
    # cannot be null (it is null for 'created').
    entry = component(openapi, "HistoryEntry")
    fields = entry["properties"]

    assert set(fields) == {"id", "event_type", "from_status", "to_status", "occurred_at"}
    assert enum_values(openapi, fields["event_type"]) == ["created", "status_changed"]
    assert {"type": "null"} in fields["from_status"]["anyOf"]
    assert "from_status" in entry["required"]


@pytest.mark.parametrize("model, field", [("Ticket", "created_at"), ("HistoryEntry", "occurred_at")])
def test_timestamps_always_have_microseconds(openapi, model, field):
    """HIST assumption 3, HIST-11, KSP-20 decision 1: fixed UTC format with microseconds."""
    # Catches: a format without fixed microseconds, which breaks text sorting.
    # Pydantic's datetime drops zero microseconds, hence a string with a pattern.
    schema = component(openapi, model)["properties"][field]
    pattern = schema["pattern"]

    assert schema["type"] == "string"
    assert re.fullmatch(pattern, "2026-10-22T09:00:00.000000Z")
    assert re.fullmatch(pattern, "2026-10-22T09:05:12.123456Z")
    assert not re.fullmatch(pattern, "2026-10-22T09:00:00Z")
    assert not re.fullmatch(pattern, "2026-10-22T09:00:00.123Z")


@pytest.mark.parametrize("method, path, status", DECLARED_ERRORS)
def test_error_responses_are_declared_with_detail(openapi, method, path, status):
    """CORE-16, HIST-14: every declared error is {"detail": "<text>"}."""
    # Catches: an undeclared error, or FastAPI's default 422 (an English list of
    # objects) on POST and PATCH instead of a single detail string.
    schema = resolve(openapi, response_schema(openapi, method, path, status))

    assert schema["properties"]["detail"]["type"] == "string"
    assert schema["required"] == ["detail"]
