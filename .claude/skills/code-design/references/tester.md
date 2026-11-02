# Tester

Frontend testas med **Vitest** och React Testing Library. Backend testas med **pytest** och det valda ramverkets testklient. Båda testsviterna körs i GitHub Actions och ska vara gröna före merge till main (Q6). Verifieringsplanen ([docs/verifieringsplan.md](../../../../docs/verifieringsplan.md)) avgör *vad* som testas – den här filen avgör *hur*.

## Koppling till verifieringsplanen

- Varje test som täcker ett planerat test har test-ID:t först i namnet:
  - pytest: `def test_t04_title_with_101_characters_is_rejected(): ...`
  - Vitest: `it('T04: visar fel när rubriken är längre än 100 tecken', ...)`
- När ett test finns: ersätt "Saknas" i verifieringsplanens kolumn Testlänk med en relativ länk till testfilen.
- Skriv aldrig in resultat i verifieringsplanen som inte kommer från en faktisk körning.

## Var testerna ligger

| Nivå | Plats | Vad |
|---|---|---|
| Backend, logik | `backend/tests/unit/` | `domain/validation.py`, `TicketService` med fejkat repository |
| Backend, integration | `backend/tests/integration/` | API + service + riktig SQLite-fil |
| Frontend | bredvid filen, `*.test.ts(x)` | domänfunktioner, komponenter, hooks med mockad API-klient |

## Testlagring

- Integrationstester använder **alltid** en temporär databasfil via pytest-fixturen `tmp_path` – aldrig `backend/data/tickets.db` och aldrig `:memory:` (minneslagring bevisar inte K3).
- Gemensamma fixtures i `backend/tests/conftest.py`:

```python
@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    return tmp_path / "test.db"

@pytest.fixture
def client(db_path: Path):
    # Testklienten kommer från det valda ramverket.
    return make_test_client(create_app(db_path=db_path))
```

- **Beständighet (T06, T10):** skapa data med en app, skapa sedan en *ny* app mot samma `db_path` och läs. Att läsa från samma objekt räcker inte.
- **Lagringsfel (T13, T14, K7):** två nivåer, båda krävs.
  1. *Integrationstest med riktig SQLite* (krävs av kravspecifikationen): framkalla ett kontrollerat fel **efter** att skrivningen påbörjats men **före** commit, t.ex. med en `sqlite3`-trigger som gör `RAISE(ABORT, …)` eller ett repository som kastar mitt i transaktionen. Öppna sedan en **ny anslutning** och kontrollera att tidigare data är oförändrad.
  2. *Logiktest med simulerat fel*: ge servicen ett repository som kastar `StorageError` och kontrollera att resultatet blir ett hanterat fel. Kompletterar men ersätter inte nivå 1.

  Skriv i testets docstring var och hur felet framkallas.
- Tester får inte bero på varandras ordning eller data.

## Struktur i ett test

Arrange–Act–Assert, med en tom rad mellan delarna. Ett beteende per test. Parametrisera närliggande fall:

```python
@pytest.mark.parametrize("title", ["", "   ", "\n\t"])
def test_t02_t03_empty_or_blank_title_is_rejected(client, title: str) -> None:
    payload = valid_ticket_payload(title=title)

    response = client.post("/api/tickets", json=payload)

    assert response.status_code == 422
    assert "title" in response.json()["error"]["fields"]
    assert client.get("/api/tickets").json()["items"] == []
```

- Assertera på `code` och vilket fält felet gäller, inte på exakt feltext (enligt verifieringsplanen). Undantag: frontendtester som kontrollerar att backendens text faktiskt visas.
- Kontrollera i error-path-tester även att **inget sparades** eller att **inget ändrades**.

## Testdata

- Hjälpfunktion `valid_ticket_payload(**overrides)` i `conftest.py` (backend) och `makeTicket(overrides)` i `frontend/src/test/factories.ts`. Testerna anger bara det som är relevant för fallet.
- Bara påhittat innehåll. Gränsfall för längd skapas med `"a" * 100`, `"a" * 101` osv.
- Trimning och längd testas med **samma testfall på båda sidor**: blanksteg, tabbar, radbrytningar, emoji (även sammansatta) och längdgränserna. Lägg fallen i en gemensam tabell i båda testfilerna så att det syns om de glider isär.
- Använd en fast klocka i servicetester, så att `created_at` är förutsägbar.

## Frontend

- Hitta element som en användare gör: `getByRole`, `getByLabelText`, `getByText`. Inte `data-testid` om det inte går att undvika.
- Mocka `src/api/tickets.ts` med `vi.mock`, inte `fetch`.
- Testa minst: att fält-fel visas vid rätt fält, att inmatning finns kvar efter fel, att "sparat" inte visas vid `storage_error`, tomlägen och statusfiltret – inklusive att filtret finns kvar efter att man öppnat ett ärende och gått tillbaka, och att ett ärende som bytt status försvinner ur det filtrerade urvalet.

## Kommandon

Kör från respektive mapp och redovisa faktiskt utfall:

| | Frontend (`frontend/`) | Backend (`backend/`) |
|---|---|---|
| Tester | `npm run test` | `pytest` |
| Lint | `npm run lint` | `ruff check .` |
| Formatering | `npm run format:check` | `ruff format --check .` |

När kommandona ändras uppdateras README och verifieringsplanen i samma PR.
