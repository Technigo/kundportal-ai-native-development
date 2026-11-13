import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE_URL = f"sqlite:///{BACKEND_DIR / 'data' / 'app.db'}"


def database_url_from_env() -> str:
    """Läser DATABASE_URL, annars en fil i backend/data/ (oberoende av var man startar)."""
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)
