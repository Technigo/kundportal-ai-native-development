import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.seed_demo import main


@pytest.mark.integration
def test_demo_command_can_run_repeatedly_without_duplicate_tickets(capsys):
    main()
    first_run = capsys.readouterr().out
    main()
    second_run = capsys.readouterr().out

    assert first_run == "Skapade 3 demonstrationsärenden.\n"
    assert second_run == "Skapade 0 demonstrationsärenden.\n"
    assert len(TestClient(app).get("/api/tickets").json()) == 3
