# Tester

Frontend testas med **Vitest** och React Testing Library (jsdom). Backend testas med **pytest** och FastAPI:s `TestClient` mot en riktig MySQL-testdatabas. Båda testsviterna ska köras i GitHub Actions och vara gröna före merge till main (Q6).

Verifieringsplanen ([docs/verifieringsplan.md](../../../../docs/verifieringsplan.md)) avgör *vad* som testas – den här filen avgör *hur*.

## Koppling till verifieringsplanen

- Testnamn beskriver beteendet: `test_unknown_ticket_id_returns_404_for_read_and_status_change`. Test-ID i namnet behövs inte.
- Kopplingen görs i verifieringsplanen: kolumnen Testlänk länkar till testfilen eller testgruppen.
- Skriv aldrig in resultat i verifieringsplanen som inte kommer från en faktisk körning. Ange exakt kommando, datum och antal godkända, misslyckade och överhoppade tester.

## Backend

**Var:** `backend/tests/`, en fil per beteendeområde: `test_ticket_validation.py`, `test_ticket_status_and_listing.py`, `test_ticket_storage_failures.py` …

**Testdatabasen**
- Integrationstester markeras `@pytest.mark.integration` och körs mot den separata MySQL-tjänsten `mysql-test` (port 3307, databas och användare `kundportal_test`) via `TEST_DATABASE_URL`.
- `conftest.py` kontrollerar URL:en och den anslutna identiteten, migrerar med Alembic och tömmer `tickets` före och efter varje integrationstest. Ändra inte de skydden.
- **Tester får aldrig använda `DATABASE_URL` eller utvecklingsdatabasen.** Inga `:memory:`- eller SQLite-ersättningar – de bevisar inte K3 eller K7 mot den lagring vi faktiskt använder.
- Tester får inte bero på varandras ordning eller data.

**Beständighet (K3):** skapa data via API:t, gör `dispose_engine()` så att anslutningarna stängs, och läs sedan via en ny klient och session. Att läsa från samma sessionsobjekt räcker inte.

**Lagringsfel (K7)** – mönstret i `test_ticket_storage_failures.py`:
- Framkalla ett kontrollerat fel i en *riktig* MySQL-transaktion med SQLAlchemy-events (`after_flush`, `before_commit`, `after_commit`) via `app.dependency_overrides[get_session]`.
- Kontrollera både svaret (`503 storage_unavailable` eller `500 save_outcome_unknown`) och **databasens faktiska innehåll efteråt** via en ny anslutning.
- Skriv i en kommentar eller docstring vid vilket steg felet framkallas och vad testet *inte* bevisar.

**Testdata:** utgå från `VALID_TICKET` i `tests/ticket_examples.py` och ändra bara det som är relevant: `{**VALID_TICKET, "title": "a" * 101}`.

## Frontend

**Var:** bredvid filen, `Komponent.test.tsx`. Setup i `src/test-setup.ts`.

- Hitta element som en användare gör: `getByRole`, `getByLabelText`, `getByText`. Inte `data-testid` om det inte går att undvika.
- Mocka `src/api/` med `vi.mock`, inte `fetch`. Undantag: tester av själva API-klienten.
- Mockade svar ska följa API-kontraktet exakt, med fält, maskinvärden, felformat och tidsformat med sex decimaler.
- Testa minst:
  - fält-fel visas vid rätt fält och inmatningen finns kvar
  - "sparat" visas inte vid `storage_unavailable`, och vid `save_outcome_unknown` visas "kunde inte bekräftas" utan nytt försök
  - tomlägen och okänt ärende
  - statusfiltret: finns kvar efter öppna/tillbaka, ett ärende som bytt status försvinner ur filtrerat urval
  - `formatDate` med en riktig tidssträng från kontraktet (`2026-10-31T22:08:34.123456Z`)

Simulerade API-svar räcker inte för att godkänna en integrerad funktion (Q6). Den verifieras också mot riktig backend.

## Gemensamma fall för trimning och längd

Frontend och backend ska testa samma fall: vanliga blanksteg, tabbar, radbrytningar, `U+00A0`, emoji (även sammansatta) och gränserna 1, max och max + 1 för varje textfält. Lägg fallen som en tabell i båda testfilerna så att det syns om de glider isär.

## Kommandon

Kör från respektive mapp och redovisa faktiskt utfall:

| | Kommando | Kräver |
|---|---|---|
| Backend utan databas | `.\.venv\Scripts\python.exe -m pytest -q -m "not integration"` | – |
| Backend, hela sviten | `.\.venv\Scripts\python.exe -m pytest -q` | `docker compose --profile test up -d mysql-test` och `TEST_DATABASE_URL` i `.env` |
| Frontend, tester | `npm test` | – |
| Frontend, typkontroll och bygge | `npm run build` | – |

Om hela backendsviten inte kunde köras ska det stå uttryckligen – "integrationstester ej körda" – aldrig att alla tester passerade. Ändras kommandona uppdateras README och verifieringsplanen i samma PR.
