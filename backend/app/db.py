import os
import sqlite3
from pathlib import Path

DEFAULT_DB_PATH = Path(__file__).parent / "data" / "nors.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS arenden (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    rubrik      TEXT NOT NULL CHECK (length(trim(rubrik)) > 0),
    beskrivning TEXT NOT NULL CHECK (length(trim(beskrivning)) > 0),
    kategori    TEXT NOT NULL,
    prioritet   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Nytt'
                CHECK (status IN ('Nytt', 'Pågående', 'Väntar på kund', 'Avslutat')),
    skapad      TEXT NOT NULL
);
"""


def get_db_path() -> str:
    return os.environ.get("NORS_DB_PATH", str(DEFAULT_DB_PATH))


def get_connection(db_path: str | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path or get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(db_path: str | None = None) -> None:
    path = db_path or get_db_path()
    if path != ":memory:":
        Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection(path)
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()
