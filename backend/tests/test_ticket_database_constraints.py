import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.database import get_session_factory


INSERT_TICKET = text(
    "INSERT INTO tickets "
    "(customer_id, customer_name, title, description, category, priority, status, created_at) "
    "VALUES ('C-1', 'Exempelkund', 'Rubrik', 'Text', :category, :priority, :status, "
    "'2026-11-01 10:00:00.000000')"
)
VALID_COLUMNS = {"category": "billing", "priority": "normal", "status": "new"}


@pytest.mark.integration
@pytest.mark.parametrize(
    "column, invalid_value",
    (
        ("category", "unknown"),
        ("category", ""),
        ("priority", "urgent"),
        ("priority", ""),
        ("status", "done"),
        ("status", ""),
    ),
)
def test_database_rejects_values_outside_allowed_lists_without_the_api(
    column, invalid_value
):
    # Skriver direkt med SQL för att visa att databasen skyddar data även om
    # API:ts validering kringgås. Testet bevisar inget om API-lagret.
    with get_session_factory()() as session:
        with pytest.raises(DBAPIError):
            session.execute(INSERT_TICKET, {**VALID_COLUMNS, column: invalid_value})
            session.commit()
        session.rollback()
        assert session.scalar(text("SELECT COUNT(*) FROM tickets")) == 0
