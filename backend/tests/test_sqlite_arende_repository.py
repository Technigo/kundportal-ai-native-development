from app.repositories import sqlite_arende_repository
from app.schemas.arende import ArendeCreate, ArendeStatus


def test_a8_statussvar_paverkas_inte_av_senare_andring(tmp_path, monkeypatch):
    """Statussvaret ska inte påverkas av en senare ändring i databasen."""
    db_path = str(tmp_path / "nors.db")
    repo = sqlite_arende_repository.SqliteArendeRepository(db_path)
    arende = repo.create(
        ArendeCreate(
            rubrik="Test",
            beskrivning="Beskrivning",
            kategori="Teknik",
            prioritet="Medel",
        )
    )
    get_connection = sqlite_arende_repository.get_connection
    
    # Simulera en samtidig ändring av status i databasen.
    class ConnectionMedSamtidigAndring:
        def __init__(self, connection):
            self.connection = connection

        def __getattr__(self, name):
            return getattr(self.connection, name)

        def commit(self):
            self.connection.commit()
            other = get_connection(db_path)
            try:
                other.execute(
                    "UPDATE arenden SET status = ? WHERE id = ?",
                    (ArendeStatus.AVSLUTAT.value, arende.id),
                )
                other.commit()
            finally:
                other.close()

    monkeypatch.setattr(
        sqlite_arende_repository,
        "get_connection",
        lambda path: ConnectionMedSamtidigAndring(get_connection(path)),
    )

    uppdaterat = repo.update_status(arende.id, ArendeStatus.PAGAENDE)

    assert uppdaterat == arende.model_copy(update={"status": ArendeStatus.PAGAENDE})
    assert repo.get_by_id(arende.id).status == ArendeStatus.AVSLUTAT


def test_legacy_varden_returneras_oforandrade(tmp_path):
    db_path = str(tmp_path / "nors.db")
    repo = sqlite_arende_repository.SqliteArendeRepository(db_path)
    conn = sqlite_arende_repository.get_connection(db_path)
    try:
        conn.execute(
            "INSERT INTO arenden "
            "(rubrik, beskrivning, kategori, prioritet, status, skapad) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                "Äldre ärende",
                "Sparat med tidigare värden.",
                "Support",
                "Normal",
                ArendeStatus.NYTT.value,
                "2026-11-06T12:00:00+00:00",
            ),
        )
        conn.commit()
    finally:
        conn.close()

    arende = repo.get_by_id(1)

    assert arende is not None
    assert arende.kategori == "Support"
    assert arende.prioritet == "Normal"
