# Backend: Python + FastAPI + SQLite

Python 3.12. FastAPI för HTTP, standardbibliotekets `sqlite3` för lagring – ingen ORM. Lint och formatering med Ruff (radlängd 100). Typannoteringar på alla funktioner.

## Namngivning

| Vad | Stil | Exempel |
|---|---|---|
| Moduler och filer | `snake_case` | `ticket_service.py`, `ticket_repository.py` |
| Funktioner och variabler | `snake_case` | `create_ticket`, `created_at` |
| Klasser | `PascalCase` | `Ticket`, `TicketRepository`, `StorageError` |
| Enums | `PascalCase`, medlemmar `UPPER_SNAKE_CASE` | `TicketStatus.IN_PROGRESS = "in_progress"` |
| Konstanter | `UPPER_SNAKE_CASE` | `TITLE_MAX_LENGTH` |
| Tabeller | `snake_case`, plural | `tickets` |
| Testfiler | `test_<modul>.py` | `test_ticket_service.py` |

## Domän: `app/domain/`

- `ticket.py`: `Category`, `Priority`, `TicketStatus` som `StrEnum`, längdkonstanter och en frusen `@dataclass(frozen=True) Ticket`.
- `validation.py`: rena funktioner utan I/O som trimmar och validerar. Returnerar antingen de trimmade värdena eller kastar `ValidationError` med en `fields`-dict.
- `errors.py`: feltyperna och deras svenska meddelanden. Alla felmeddelanden som når användaren definieras här.

```python
class AppError(Exception):
    """Basklass för fel som ska nå klienten."""

class ValidationError(AppError):
    def __init__(self, fields: dict[str, str]) -> None:
        super().__init__("Ärendet kunde inte sparas. Rätta de markerade fälten.")
        self.fields = fields

class TicketNotFoundError(AppError): ...
class StorageError(AppError): ...
```

Feltexter per fält, använd exakt dessa:

| Fält | Fall | Text |
|---|---|---|
| `title` | tom | Ange en rubrik |
| `title` | för lång | Rubriken får innehålla högst 100 tecken |
| `description` | tom | Ange en beskrivning |
| `description` | för lång | Beskrivningen får innehålla högst 5 000 tecken |
| `category` | saknas/ogiltig | Välj en kategori |
| `priority` | saknas/ogiltig | Välj en prioritet |
| `status` | saknas/ogiltig | Välj en giltig status |

## Service: `app/services/ticket_service.py`

- Klassen `TicketService` får ett repository och en klocka (`now: Callable[[], datetime]`) i konstruktorn. Klockan gör skapandetid testbar.
- Metoder: `create_ticket`, `list_tickets(status: TicketStatus | None)`, `get_ticket(id)`, `update_status(id, status)`.
- Servicen validerar **all** inmatning, även om frontend redan gjort det (K2).
- Servicen sätter `status = TicketStatus.NEW` och `created_at = now()` – aldrig klienten.
- Servicen översätter inte till HTTP. Den kastar domänfel.

## Lagring: `app/storage/`

- `db.py`: `connect(path: Path) -> sqlite3.Connection` som slår på `PRAGMA foreign_keys = ON`, sätter `row_factory = sqlite3.Row` och kör `schema.sql` (`CREATE TABLE IF NOT EXISTS`).
- `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS tickets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('invoice', 'technical_support', 'other')),
    priority    TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high')),
    status      TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'waiting_for_customer', 'closed')),
    created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tickets_status_created ON tickets (status, created_at DESC);
```

- `ticket_repository.py`: `TicketRepository` med `insert`, `list(status)`, `get(id)`, `update_status(id, status)`. Returnerar `Ticket`-objekt, aldrig rader.
- **Alltid parametriserade frågor** (`?`). Bygg aldrig SQL med f-strängar eller `+`.
- Varje skrivning i en transaktion: `with conn:` – vid fel rullas allt tillbaka, så att tidigare data är oförändrad (K7).
- `sqlite3.Error` fångas i repositoryt och kastas om som `StorageError` (med originalet som `__cause__` för loggning).
- Sortering: `ORDER BY created_at DESC, id DESC`.

## Konfiguration

- Databasens sökväg från miljövariabeln `KSP_DB_PATH`, standard `backend/data/tickets.db`. Mappen `backend/data/` ligger i `.gitignore`.
- Ingen annan konfiguration behövs. Inga hemligheter.

## API: `app/api/`

- `create_app(db_path: Path | None = None) -> FastAPI` i `main.py`. Testerna skapar appen med egen databas.
- Request- och response-scheman som Pydantic-modeller i `app/api/schemas.py`. Enum-fälten tas emot som `str` och valideras av servicen, så att felmeddelandena följer vårt format och inte FastAPI:s standard.
- Exception handlers översätter domänfel till felformatet i [arkitektur.md](arkitektur.md#felformat): `ValidationError` → 422, `TicketNotFoundError` → 404, `StorageError` → 503, övrigt → 500. Ersätt även FastAPI:s egen `RequestValidationError` så att den följer samma format.
- Routes är tunna: läs in, anropa servicen, returnera. Inga `try/except` i routes – det sköts av handlers.
- CORS tillåts bara för Vites utvecklingsserver (`http://localhost:5173`).

## Loggning

- `logging`-modulen, en logger per modul: `logger = logging.getLogger(__name__)`.
- Logga `StorageError` och oväntade fel med `logger.exception(...)`. Logga aldrig hela ärendebeskrivningar.
- Inga `print()` i applikationskoden.
