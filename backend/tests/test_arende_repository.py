from app.repositories.arende_repository import InMemoryArendeRepository
from app.schemas.arende import ArendeCreate, ArendeStatus

# Testfall för att kontrollera att uppdatering av status fungerar korrekt.
def test_a8_minneslagring_andrar_bara_status_och_okant_id_ger_none():
    repo = InMemoryArendeRepository()
    skapat = repo.create(
        ArendeCreate(
            rubrik="Test",
            beskrivning="Beskrivning",
            kategori="Teknik",
            prioritet="Medel",
        )
    )

    uppdaterat = repo.update_status(skapat.id, ArendeStatus.PAGAENDE)

    assert uppdaterat == skapat.model_copy(update={"status": ArendeStatus.PAGAENDE})
    assert skapat.status == ArendeStatus.NYTT
    assert repo.update_status(999, ArendeStatus.PAGAENDE) is None
