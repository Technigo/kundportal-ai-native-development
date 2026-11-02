# Backend: FastAPI + SQLAlchemy + MySQL

Python 3.9 eller senare (enligt README). FastAPI för HTTP, Pydantic för validering, SQLAlchemy 2.0 för databasåtkomst, Alembic för migrationer och MySQL via Docker Compose. Beroenden i `backend/requirements.txt` – lägg inte till nya utan att fråga.

## Struktur

Backend har en platt struktur i `backend/app/`. Följ den. Inför inte ett servicelager eller nya mappar utan att teamet beslutat det (se "Öppna beslut" i SKILL.md).

| Fil | Ansvar | Inte här |
|---|---|---|
| `main.py` | Skapar `app`, CORS, registrerar routers och felhanterare, health-endpoints | Ärendelogik |
| `tickets.py` | `APIRouter(prefix="/api/tickets")`: läs in, databasoperation, returnera | SQL-strängar, egen validering av fältregler |
| `schemas.py` | Pydantic-modeller, `Literal`-typer för maskinvärden, trimning, längdgränser | Databasåtkomst |
| `models.py` | SQLAlchemy-modeller och CHECK-constraints | HTTP |
| `database.py` | Engine, `get_session`, `DATABASE_URL` | Affärsregler |
| `api_errors.py` | `ApiError(status_code, code, message, fields)` | – |

## Namngivning och stil

| Vad | Stil | Exempel |
|---|---|---|
| Moduler | `snake_case` | `tickets.py`, `api_errors.py` |
| Funktioner och variabler | `snake_case` | `update_ticket_status`, `created_at` |
| Klasser | `PascalCase` | `Ticket`, `TicketCreate`, `TicketResponse` |
| Pydantic-modeller | `<Resurs><Syfte>` | `TicketCreate`, `TicketStatusUpdate`, `TicketResponse` |
| Tabeller | `snake_case`, plural | `tickets` |
| Constraint-namn | `ck_<tabell>_<kolumn>` | `ck_tickets_status` |

- Typannoteringar på alla funktioner. Eftersom Python 3.9 stöds: använd `Optional[X]` från `typing`, **inte** `X | None`.
- PEP 8. Ingen linter är vald än.

## Validering: `schemas.py`

- Request-modeller har `model_config = ConfigDict(extra="forbid")`, så att okända fält ger `422`.
- Maskinvärden är `Literal`-typer (`Category`, `Priority`, `Status`) och ska stämma med API-kontraktet och CHECK-constraints i `models.py`.
- Textfält trimmas med en `field_validator(..., mode="before")` och `value.strip(WHITE_SPACE)`. Längdgränser med `Field(min_length=..., max_length=...)`.
- Klienten kan aldrig skicka `id`, `status` eller `created_at` vid registrering – de finns inte i `TicketCreate`.

## Routes: `tickets.py`

- Sessionen injiceras: `session: Session = Depends(get_session)`.
- Använd SQLAlchemy-uttryck (`select(...)`, `session.get(...)`). Skriv aldrig SQL som strängar med inklistrade värden.
- Okänt ID: `raise ApiError(404, "not_found", "Ärendet kunde inte hittas.")`.
- Alla skrivningar går genom `commit_write(session)`:
  - fel vid `flush` → rollback och `503 storage_unavailable` (säkert misslyckat)
  - fel vid `commit` → `500 save_outcome_unknown` (utfallet okänt – påstå inte rollback)
- Läsfel från databasen → `503 storage_unavailable`.
- Sortering: `created_at` fallande.

## Felhantering

- Kasta `ApiError` – returnera inte `JSONResponse` direkt från routes.
- Felhanterarna i `main.py` gör om `ApiError` och `RequestValidationError` till felformatet i API-kontraktet. Ändras formatet ändras kontraktet först.
- Tekniska detaljer (SQL, stacktrace, anslutningsuppgifter) skickas aldrig till klienten. Kedja originalfelet med `raise ... from error` så att det syns i loggar.

## Databas och migrationer

- `DATABASE_URL` från `.env` pekar på utvecklingsdatabasen `kundportal_dev`. Testerna använder `TEST_DATABASE_URL` (se [tester.md](tester.md)).
- **Varje schemaändring kräver en Alembic-migration** i `backend/migrations/versions/` med löpnummer i filnamnet (`0002_<beskrivning>.py`). Ändra aldrig en migration som redan är mergad – skapa en ny.
- Schemat skapas aldrig automatiskt vid start. Migrationer körs uttryckligen med `alembic upgrade head`.
- Tid lagras i UTC (`DATETIME(fsp=6)`) och serialiseras med `Z`, enligt `TicketResponse`.
- Demodata finns bara i `seed_demo.py`, körs uttryckligen och ska tåla att köras flera gånger.

## Loggning

- `logging`-modulen, en logger per modul: `logger = logging.getLogger(__name__)`.
- Logga aldrig hela ärendebeskrivningar, kunduppgifter eller anslutningssträngar.
- Inga `print()` i applikationskoden, utom i kommandon som `seed_demo.py`.
