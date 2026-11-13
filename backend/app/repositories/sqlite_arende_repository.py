import sqlite3
from datetime import datetime, timezone

from app.db import get_connection, init_db
from app.repositories.arende_repository import ArendeRepository
from app.schemas.arende import Arende, ArendeCreate, ArendeStatus


class SqliteArendeRepository(ArendeRepository):
    """Beständig lagring av ärenden i SQLite med rå SQL."""

    def __init__(self, db_path: str | None = None) -> None:
        self._db_path = db_path
        init_db(db_path)

    def create(self, data: ArendeCreate) -> Arende:
        skapad = datetime.now(timezone.utc)
        conn = get_connection(self._db_path)
        try:
            cursor = conn.execute(
                "INSERT INTO arenden (rubrik, beskrivning, kategori, prioritet, status, skapad) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    data.rubrik,
                    data.beskrivning,
                    data.kategori,
                    data.prioritet,
                    ArendeStatus.NYTT.value,
                    skapad.isoformat(),
                ),
            )
            conn.commit()
            arende_id = cursor.lastrowid
        finally:
            conn.close()
        return Arende(
            id=arende_id,
            **data.model_dump(),
            status=ArendeStatus.NYTT,
            skapad=skapad,
        )

    def get_all(self) -> list[Arende]:
        conn = get_connection(self._db_path)
        try:
            rows = conn.execute("SELECT * FROM arenden ORDER BY id").fetchall()
        finally:
            conn.close()
        return [self._to_arende(row) for row in rows]

    def get_by_id(self, arende_id: int) -> Arende | None:
        conn = get_connection(self._db_path)
        try:
            row = conn.execute(
                "SELECT * FROM arenden WHERE id = ?", (arende_id,)
            ).fetchone()
        finally:
            conn.close()
        return self._to_arende(row) if row else None

    def update_status(
        self, arende_id: int, new_status: ArendeStatus
    ) -> Arende | None:
        """Returnera det uppdaterade ärendet eller None om det saknas."""
        conn = get_connection(self._db_path)
        try:
            cursor = conn.execute(
                "UPDATE arenden SET status = ? WHERE id = ?",
                (new_status.value, arende_id),
            )
            row = None
            if cursor.rowcount:
                row = conn.execute(
                    "SELECT * FROM arenden WHERE id = ?", (arende_id,)
                ).fetchone()
            conn.commit()
        finally:
            conn.close()
        return self._to_arende(row) if row else None

    @staticmethod
    def _to_arende(row: sqlite3.Row) -> Arende:
        return Arende(
            id=row["id"],
            rubrik=row["rubrik"],
            beskrivning=row["beskrivning"],
            kategori=row["kategori"],
            prioritet=row["prioritet"],
            status=ArendeStatus(row["status"]),
            skapad=datetime.fromisoformat(row["skapad"]),
        )
