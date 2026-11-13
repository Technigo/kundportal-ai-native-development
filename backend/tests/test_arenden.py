"""API-tester för att registrera och hämta ärenden.

Varje test startar en egen server mot en egen databas i tmp_path.
"""

from datetime import datetime

from server import anrop, kor_server

GILTIGT = {
    "rubrik": "Fakturan saknas",
    "beskrivning": "Kunden har inte fått oktoberfakturan.",
    "kategori": "Fakturering",
    "prioritet": "Hög",
}

# Testfall för att kontrollera att ett nytt ärende får status "Nytt" och syns i listan.
def test_a1_nytt_arende_far_status_nytt_och_syns_i_listan(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        _, fore = anrop(f"{url}/arenden")
        status, skapat = anrop(f"{url}/arenden", GILTIGT)
        _, alla = anrop(f"{url}/arenden")

    assert fore == []
    assert status == 201
    assert {falt: skapat[falt] for falt in GILTIGT} == GILTIGT
    assert skapat["status"] == "Nytt"
    datetime.fromisoformat(skapat["skapad"])  # Kastar om skapad-tiden saknas eller är ogiltig.
    assert alla == [skapat]


TEKNISK_TEXT = ("Value error", "Field required", "String should", "Input should")

# Hjälpfunktioner för att kontrollera felmeddelanden i svar från API:et.
def _besked(svar: dict, falt: str) -> list[str]:
    """Texterna för ett fält i FastAPIs 422-format, och kontrollerar att inget är tekniskt."""
    detaljer = svar["detail"]
    assert isinstance(detaljer, list)
    texter = [d["msg"] for d in detaljer if d["loc"][-1] == falt]
    for text in texter:
        assert not any(teknisk in text for teknisk in TEKNISK_TEXT), text
    return texter

# Hjälpfunktion för att kontrollera att ett ärende avvisas och inget sparas.
def _avvisas_och_inget_sparas(url: str, utan: dict, falt: str, forvantat: str) -> None:
    """Skapa två ärenden och kontrollera att ett ogiltigt tredje inte sparas."""
    for _ in range(2):
        assert anrop(f"{url}/arenden", GILTIGT)[0] == 201
    _, fore = anrop(f"{url}/arenden")
    status, svar = anrop(f"{url}/arenden", utan)
    _, efter = anrop(f"{url}/arenden")

    assert status == 422
    assert _besked(svar, falt) == [forvantat]
    assert efter == fore

# Testfall för att kontrollera att rubrikfältet valideras korrekt.
def test_a2_saknad_eller_tom_rubrik_avvisas_och_inget_sparas(tmp_path):
    saknas = {k: v for k, v in GILTIGT.items() if k != "rubrik"}
    tom = {**GILTIGT, "rubrik": ""}
    with kor_server(tmp_path / "saknas.db") as url:
        _avvisas_och_inget_sparas(url, saknas, "rubrik", "Måste fyllas i")
    with kor_server(tmp_path / "tom.db") as url:
        _avvisas_och_inget_sparas(
            url, tom, "rubrik", "Får inte vara tomt eller bara mellanslag"
        )

# Testfall för att kontrollera att rubrikfältet med bara mellanslag avvisas korrekt.
def test_a3_rubrik_med_bara_mellanslag_avvisas_och_inget_sparas(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        _avvisas_och_inget_sparas(
            url,
            {**GILTIGT, "rubrik": "   "},
            "rubrik",
            "Får inte vara tomt eller bara mellanslag",
        )

# Testfall för att kontrollera att ogiltiga kategorier avvisas korrekt.
def test_a4_otillaten_kategori_avvisas_och_inget_sparas(tmp_path):
    for nr, fel in enumerate(("Support", "fakturering", None, 5)):
        with kor_server(tmp_path / f"{nr}.db") as url:
            _avvisas_och_inget_sparas(
                url,
                {**GILTIGT, "kategori": fel},
                "kategori",
                "Ogiltig kategori. Välj Fakturering, Teknik, Leverans eller Övrigt.",
            )


# Testfall för att kontrollera att ogiltiga prioriteringar avvisas korrekt.
def test_a11_otillaten_prioritet_avvisas_och_inget_sparas(tmp_path):
    for nr, fel in enumerate(("Normal", "hög", None, 5)):
        with kor_server(tmp_path / f"{nr}.db") as url:
            _avvisas_och_inget_sparas(
                url,
                {**GILTIGT, "prioritet": fel},
                "prioritet",
                "Ogiltig prioritet. Välj Låg, Medel eller Hög.",
            )

# Testfall för att kontrollera att statusändringen sparas, överlever omstart och inte rör andra fält.
def test_a8_statusandring_sparas_efter_omstart_och_andra_falt_oforandrade(tmp_path):
    db = tmp_path / "nors.db"
    with kor_server(db) as url:
        _, skapat = anrop(f"{url}/arenden", GILTIGT)
        status, svar = anrop(f"{url}/arenden/{skapat['id']}/status", {"status": "Pågående"})
    with kor_server(db) as url:
        _, efter = anrop(f"{url}/arenden/{skapat['id']}")

    assert status == 200
    assert svar == {**skapat, "status": "Pågående"}
    assert efter == svar


# Testfall för att kontrollera att en ogiltig status avvisas och den gamla ligger kvar.
def test_a9_ogiltig_status_avvisas_och_gamla_statusen_ligger_kvar(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        _, skapat = anrop(f"{url}/arenden", GILTIGT)
        adress = f"{url}/arenden/{skapat['id']}/status"
        for fel in ("Klart", "nytt", None, 5):
            status, svar = anrop(adress, {"status": fel})
            assert status == 422
            assert _besked(svar, "status") == ["Ogiltig status"]
        _, efter = anrop(f"{url}/arenden/{skapat['id']}")

    assert efter == skapat


# Testfall för att kontrollera att statusändring av ett okänt ärende ger svenskt besked.
def test_a10_statusandring_for_okant_arende_ger_svenskt_besked(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        status, svar = anrop(f"{url}/arenden/999/status", {"status": "Pågående"})

    assert status == 404
    assert svar == {"detail": "Ärendet hittades inte"}


# Testfall för att kontrollera att okända ärenden ger ett svenskt felmeddelande.
def test_a10_okant_arende_ger_svenskt_besked(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        status, svar = anrop(f"{url}/arenden/999")

    assert status == 404
    assert svar == {"detail": "Ärendet hittades inte"}

# Testfall för att kontrollera att stora id ger 404 vid hämtning och statusändring.
def test_a10_stora_id_ger_404_for_hamtning_och_statusandring(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        for arende_id in (2**63 - 1, 2**63, 99999999999999999999, -(2**63) - 1):
            adress = f"{url}/arenden/{arende_id}"
            assert anrop(adress) == (404, {"detail": "Ärendet hittades inte"})
            assert anrop(f"{adress}/status", {"status": "Pågående"}) == (
                404, {"detail": "Ärendet hittades inte"}
            )

        status, svar = anrop(f"{url}/arenden/{2**63}/status", {"status": "fel"})
        assert status == 422
        assert _besked(svar, "status") == ["Ogiltig status"]

# Testfall för att kontrollera att HTTP-fel för metod och sökväg är på svenska.
def test_r12_http_fel_for_metod_och_sokvag_ar_pa_svenska(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        put_status, put_svar = anrop(f"{url}/arenden/1", method="PUT")
        delete_status, delete_svar = anrop(f"{url}/arenden/1", method="DELETE")
        path_status, path_svar = anrop(f"{url}/fel-sokvag")

    assert put_status == 405
    assert put_svar == {"detail": "Metoden är inte tillåten"}
    assert delete_status == 405
    assert delete_svar == {"detail": "Metoden är inte tillåten"}
    assert path_status == 404
    assert path_svar == {"detail": "Sidan hittades inte"}


def test_r12_text_med_ensam_unicode_surrogat_avvisas_pa_svenska(tmp_path):
    with kor_server(tmp_path / "nors.db") as url:
        status, svar = anrop(f"{url}/arenden", {**GILTIGT, "rubrik": "\ud800"})

    assert status == 422
    assert _besked(svar, "rubrik") == ["Texten innehåller ogiltiga Unicode-tecken"]
