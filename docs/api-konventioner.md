# API-konventioner

> **Huvudversion** för konventionerna som gäller hela API:t: kärnan (CORE), statuslogik och
> historik (HIST) och frontend. Ändras bara här, via PR. Specarna och Linear hänvisar hit.
> Ansvarig: Azalea (backend) · Granskare: Mustafa (frontend), Nicklas (CORE).
> Flyttad från Linear till repot 2026-10-25.

## 1. Statuskoder

Statusar lagras och skickas som **stabila koder på engelska**. UI visar svenska etiketter.

| Kod (API/DB) | Etikett (UI) |
| --- | --- |
| `new` | Nytt |
| `in_progress` | Pågående |
| `waiting_on_customer` | Väntar på kund |
| `closed` | Avslutat |

**Regler**

- Nya ärenden får alltid `new`.
- Alla övergångar mellan *olika* statusar är tillåtna, även att öppna ett avslutat ärende
  igen (`closed` → `new`).
- Samma status som nuvarande ger 409, för alla fyra statusar.
- Status ändras **bara** via `PATCH /tickets/{id}/status`. Inga andra endpoints ändrar status.
- Frontend håller en enda tabell från kod till etikett. Koder visas aldrig för användaren.

## 2. Felformat

Alla fel, även valideringsfel, har samma form:

```json
{ "detail": "<begripligt svenskt meddelande>" }
```

- FastAPI:s standardsvar för 422 är en lista på engelska. Backend registrerar därför en egen
  hanterare för `RequestValidationError` som översätter till formatet ovan. Starlettes eget
  fel för en kropp som inte går att tolka (400 på engelska) översätts på samma sätt.
- Meddelanden innehåller aldrig stacktrace, SQL eller databasdetaljer (HIST-14, CORE-16).
- Frontend kan alltid visa `detail` direkt för användaren.
- Felsvaren deklareras i OpenAPI (`responses={404: ..., 409: ..., 422: ...}`), så att
  frontendens genererade typer och testverktyg ser felformatet.

| HTTP | Betyder | Exempel |
| --- | --- | --- |
| 200 / 201 | Lyckat / skapat | Ärende hämtat / skapat |
| 404 | Okänt ärende, även id som inte är ett heltal (B8 i CORE, HIST-08) | `GET /tickets/999`, `GET /tickets/abc` → "Ärendet finns inte." |
| 409 | Konflikt med nuvarande läge | Samma status som nuvarande → "Ärendet har redan den statusen." (HIST-07) |
| 422 | Ogiltig indata | Tom rubrik, okänd status (`"klar"` → "Välj en giltig status.", HIST-06). Vanliga fältfel visas i fältordningen (B7) |
| 422 | Trasigt anrop | Fel datatyp (även `{"status": null}`), okända fält (även andra fält än `status` i `PATCH`), saknad kropp eller trasig JSON → bara "Ogiltig indata." (CORE-17, B9, HIST-06) |
| 500 | Oväntat fel | Svarar ändå med `{"detail": ...}` utan tekniska detaljer |
| 503 | Databasen går inte att använda just nu (tillfälligt) | `/health` → "Databasen går inte att nå just nu." · historikposten kunde inte sparas → "Statusen kunde inte ändras. Försök igen." och inget ändras (HIST-09) |

## 3. Tider

- Lagras och skickas som **UTC** i fast format `YYYY-MM-DDTHH:MM:SS.ffffffZ` (alltid
  mikrosekunder), så att textsortering blir korrekt.
- Visas i **lokal tid** i UI.

## 4. Språk och namn

- Allt som användaren ser är på **svenska**.
- Fältnamn, endpoints och statuskoder är på **engelska**, i `snake_case`.
- All kod är på **engelska**: namn på funktioner, variabler, typer och filer, och kommentarer.
  Undantag: texter som visas för användaren och felmeddelanden i `detail`, som är på svenska.
  Dokumentationen i `docs/` och commit-meddelanden skrivs fortfarande på svenska.
- Endast påhittade kunduppgifter, aldrig riktiga.

## 5. Endpoints (översikt)

| Metod och väg | Spec | Lyckat | Fel |
| --- | --- | --- | --- |
| `POST /tickets` | CORE (+ HIST skriver `created`-post) | 201, ärendet | 422 |
| `GET /tickets` | CORE | 200, lista, nyaste först | – |
| `GET /tickets/{id}` | CORE | 200, ärendet | 404 |
| `PATCH /tickets/{id}/status` | HIST | 200, ärendet med ny status | 404 · 409 · 422 · 503 |
| `GET /tickets/{id}/history` | HIST | 200, lista äldst först (minst en post) | 404 |
| `GET /health` | Skelett | 200, `{"status": "ok", "database": "ok"}` | 503 |

Detaljer, exempel och acceptanskriterier står i [specen för kärnan](specs/SPEC-karna.md)
och [specen för statuslogik och historik](specs/SPEC-arendehistorik.md).

## 6. Kontraktet mellan backend och frontend

- **Backend körs lokalt på `http://localhost:8010`** (inte uvicorns standard 8000, som ofta
  används av andra lokala appar).
- **Frontend anropar backenden via `/api/...`.** Vite skickar vidare till port 8010 och tar
  bort `/api` (se `frontend/vite.config.ts`), så ingen CORS behövs.
- **API-kontraktet är OpenAPI-schemat** som backend publicerar på `/openapi.json`.
- Frontend genererar TypeScript-typer därifrån (t.ex. `openapi-typescript`) i stället för
  att skriva dem för hand. En ändring i backend syns då som typfel i frontend.
- Valideringsregler läggs i fälten (`min_length`, `max_length`, `pattern`), inte bara i
  Python-kod, så att de syns i schemat.
- Att ändra ett kontrakt som frontend redan använder kräver att frontendansvarig tillfrågas
  först.
