# Instruktion för testförslag (v2-azalea)

> Version: **v2-azalea** · Ansvarig: Azalea (Azaalea) · Bygger på v1 (Nicklas, 2026-10-25)
> Namngiven förbättring av teamets instruktion v1, enligt teststrategin. Används som v1: hänvisa
> till filen i prompten, t.ex. *"Föreslå tester för HIST-04 enligt docs/ai/testforslag-v2-azalea.md"*.
> För krav med gränsvärden används den tillsammans med v2-nicklas.

## Syfte

Samma som v1: få fram ett genomtänkt förslag på tester för ett krav **innan** testerna skrivs,
så att granskningen sker på förslaget och inte på färdig kod.

v2-azalea lägger till skydd mot en särskild risk: **ett grönt test fast data inte sparas, eller
inte sparas tillsammans.** Ett test som läser i samma session som skrev, eller som bara
kontrollerar att en post finns, kan se rätt ut medan databasen är fel. Mutationsprövningen av
historiktesterna (KSP-43) visade det: när `commit` flyttades före historikposten föll testerna
bara för att posten saknades, och inget test kontrollerade att statusen var oförändrad. I
`TicketService.change_status` hamnade `commit` före `self.history.add(…)`. Posten lades till i
sessionen men commitades aldrig, och samma nio tester föll som när posten togs bort helt. Inget
test kunde skilja de två felen åt.

## Indata

- Ett eller flera krav-id, t.ex. `HIST-04` eller `CORE-02`.
- Specen där kravet står (`docs/specs/`), `AGENTS.md` och, för krav om sparning eller
  transaktioner, `docs/decisions/ADR-001-atomicitet-status-och-historik.md`.
- `docs/teststrategi.md` avsnitt 3: mutationerna som kraven ska fångas av.

## Gör så här

Steg 1–5 är som i v1. Steg 6–10 är nya i v2-azalea.

1. Läs kravet i specen, och de delar av specen som kravet hänvisar till (felmeddelanden,
   beslut, API-kontrakt).
2. Föreslå tester för kravet. Ta med:
   - minst ett **happy path**-fall,
   - de **error paths** som kravet nämner,
   - relevanta **gränsfall**.
3. Välj testnivå enligt [Teststrategin](../teststrategi.md) (avsnitt 2, Testnivåer)
   och säg varför.
4. Ange för varje test **vilken mutation** i koden som ska få testet att falla.
5. Skriv **inte** testkoden än. Förslaget granskas först.
6. **Nytt: läs via en annan kanal.** *Gäller när* kravet säger att något sparas, finns kvar,
   eller att inget sparas. Kontrollera resultatet via en annan kanal än den som skrev, aldrig
   i samma session. Använd en av två kanaler: (a) en ny app mot samma databasfil,
   `TestClient(create_app(database_url))`, eller (b) en egen `sqlite3`-anslutning mot filen.
   Vid omstart stängs den gamla engine först (`dispose()`), som HIST-04 kräver. Skriv kanalen i
   kolumnen *Läses via*.
7. **Nytt: framkalla fel.** *Gäller när* kravet säger att två saker sparas tillsammans (t.ex.
   status och historikpost). Föreslå minst ett test som tvingar det andra steget att kasta ett
   databasfel med `monkeypatch` (t.ex. att `HistoryRepository.add` kastar `SQLAlchemyError`).
   Kontrollera (1) svaret: statuskoden och meddelandet exakt som i specen, (2) att det första
   steget inte sparades, läst via en annan kanal (steg 6), och (3) att ingen ny historikpost
   finns.
8. **Nytt: kontroll som faller.** *Gäller alltid.* Ange för varje test vilken kontroll (assert)
   som ska slå till när mutationen finns, så att det går att granska om testet faller av rätt
   anledning.
9. **Nytt: fångar inte.** *Gäller alltid.* Ange för varje test minst en risk som testet inte
   fångar, så att ingen tror att ett grönt test bevisar mer än det gör.
10. **Nytt: varje mutation ska ha ett test.** *Gäller alltid.* Kontrollera att varje mutation i
    teststrategin för kravet har minst ett föreslaget test i *Ska falla om …*. Saknas det, skriv
    det under Frågor i stället för att hoppa över det.

## Utdata

En tabell, en rad per test. De tre sista kolumnerna är nya i v2-azalea. *Läses via* fylls bara i
för krav om sparning, annars "–".

| Testnamn | Krav-id | Givet / När / Då | Förväntat resultat | Nivå | Ska falla om … | Läses via | Kontroll som faller | Fångar inte |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `test_hist04_status_and_history_survive_restart` | HIST-04 | Givet ett ärende som bytt status till `in_progress`, när appen startas om med samma databasfil, då finns status och historik kvar | Status `in_progress` och två poster (`created`, `status_changed`) | Integration | `commit` tas bort i `change_status` | Ny app och ny engine mot samma fil | `assert status == "in_progress"` | Att status och post sparas *tillsammans* vid ett fel mitt i, eftersom det kräver ett test med framkallat fel (steg 7) |

Efter tabellen: en kort lista med **frågor** om något i specen är otydligt.

## Gränser

Samma som v1:

- Hitta inte på krav. Allt som testas ska gå att peka på i specen.
- Ändra inte specen. Är den otydlig: skriv en fråga.
- Håll dig till den spec som kravet står i. Där CORE och HIST gränsar till varandra
  föreslås fallet bara för det krav som äger beteendet.
- Förväntade felmeddelanden ska vara **exakt** de som står i specen.
- Bara påhittade uppgifter.

Nytt i v2-azalea:

- Påstå inte i *Ska falla om …* att ett test fångar en mutation om kontrollen i *Kontroll som
  faller* inte kan slå till för den mutationen.
- Steg 6 och 7 gäller bara när kravet handlar om sparning eller om två saker som sparas
  tillsammans. Lägg inte till dem på andra krav.
- Om mutationen tar bort eller flyttar en `commit`, måste kontrollen i *Kontroll som faller*
  läsa via en annan kanal (steg 6). Annars kan testet vara grönt fast inget sparades.

## Granskning (görs av människan)

Samma som v1:

- [ ] Varje test går att koppla till ett krav-id.
- [ ] Förväntat resultat är exakt (statuskod, meddelande, vad som finns i databasen).
- [ ] Varje test har en mutation som får det att falla.
- [ ] Inget test kontrollerar något som specen inte säger.

Nytt i v2-azalea:

- [ ] För krav om sparning läser testet via en annan kanal än den som skrev.
- [ ] För krav om att två saker sparas tillsammans finns ett test med framkallat fel.
- [ ] *Kontroll som faller* kan verkligen slå till för mutationen i *Ska falla om …*.
- [ ] *Fångar inte* nämner en verklig lucka, inte "inget".
- [ ] Varje mutation i teststrategin för kravet har ett test, eller står som fråga.

## När v2-azalea inte passar

v2-azalea gör störst skillnad på krav om sparning och atomicitet. På krav där specen redan säger
hur något ska kontrolleras (t.ex. HIST-07, samma status ger 409) blir skillnaden mot v1 troligen
liten, och de extra kolumnerna gör bara förslagen längre. För krav med gränsvärden: använd
v2-nicklas tillsammans med den här.
