"""Ett skapat ärende ska finnas kvar efter att servern startats om.

Testet startar den riktiga servern (uvicorn) mot en temporär databasfil,
skapar ett ärende, stoppar servern, startar en ny server och hämtar ärendet.
Den riktiga databasen (app/data/nors.db) rörs inte.
"""

from server import anrop, kor_server


def test_a5_arende_finns_kvar_efter_omstart(tmp_path):
    db_path = tmp_path / "nors.db"

    with kor_server(db_path) as url:
        status, skapat = anrop(
            f"{url}/arenden",
            {
                "rubrik": "Fakturan saknas",
                "beskrivning": "Kunden har inte fått oktoberfakturan.",
                "kategori": "Fakturering",
                "prioritet": "Hög",
            },
        )
        assert status == 201

    with kor_server(db_path) as url:
        status, hamtat = anrop(f"{url}/arenden/{skapat['id']}")
        assert status == 200
        _, alla = anrop(f"{url}/arenden")

    assert hamtat == skapat
    assert alla == [skapat]
