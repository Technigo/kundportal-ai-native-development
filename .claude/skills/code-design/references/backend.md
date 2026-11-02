# Backend: Python + SQLite

Python 3.12. Standardbibliotekets `sqlite3` för lagring – ingen ORM. Lint och formatering med Ruff (radlängd 100). Typannoteringar på alla funktioner.

**Ramverket är inte valt.** Danielle väljer backendramverk (kravspecifikationen avsnitt 8). Därför är bara `app/api/` ramverksberoende – domän, service och lagring skrivs i ren Python och kan byggas och testas redan nu. När ramverket är valt fylls avsnittet [API-lagret](#api-lagret-appapi) i med ramverkets konventioner.

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

- `ticket.py`: `Category`, `Priority`, `TicketStatus` som `StrEnum`, längdkonstanter och en frusen `@dataclass(frozen=True) Ticket` med alla fält i ärendemodellen, inklusive `customer_id` och `customer_name`.
- `text.py`: `trim_text` och `text_length` – samma regler som frontendens `text.ts` (se [arkitektur.md](arkitektur.md#fältregler)). Använd aldrig `str.strip()` direkt för fältvalidering.
- `validation.py`: rena funktioner utan I/O som trimmar och validerar. Returnerar de trimmade värdena eller kastar `ValidationError` med en `fields`-dict som samlar **alla** fel på en gång, inte bara det första.
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
| `customer_id` | tom | Ange kund-ID |
| `customer_name` | tom | Ange kundnamn |
| `title` | tom | Ange en rubrik |
| `title` | för lång | Rubriken får innehålla högst 100 tecken |
| `description` | tom | Ange en beskrivning |
| `description` | för lång | Beskrivningen får innehålla högst 5 000 tecken |
| `category` | saknas/ogiltig | Välj en kategori |
| `priority` | saknas/ogiltig | Välj en prioritet |
| `status` | saknas/ogiltig | Välj en giltig status |

Får kundfälten längdgränser i API-kontraktet läggs feltexterna till här.

## Service: `app/services/ticket_service.py`

- Klassen `TicketService` får ett repository och en klocka (`now: Callable[[], datetime]`) i konstruktorn. Klockan gör skapandetid testbar.
- Metoder: `create_ticket`, `list_tickets(status: TicketStatus | None)`, `get_ticket(id)`, `update_status(id, status)`. Inga metoder för att redigera andra fält eller radera.
- Servicen validerar **all** inmatning, även om frontend redan gjort det (K2).
- Servicen sätter `status = TicketStatus.NEW` och `created_at = now()` i UTC – aldrig klienten.
- Servicen vet ingenting om HTTP. Den kastar domänfel.

## Lagring: `app/storage/`

- `db.py`: `connect(path: Path) -> sqlite3.Connection` som slår på `PRAGMA foreign_keys = ON`, sätter `row_factory = sqlite3.Row` och kör `schema.sql` (`CREATE TABLE IF NOT EXISTS`).
- `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS tickets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id   TEXT NOT NULL CHECK (customer_id <> ''),
    customer_name TEXT NOT NULL CHECK (customer_name <> ''),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    category      TEXT NOT NULL CHECK (category IN ('invoice', 'technical_support', 'other')),
    priority      TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high')),
    status        TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'waiting_for_customer', 'closed')),
    created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tickets_status_created ON tickets (status, created_at DESC);
```

- `ticket_repository.py`: `TicketRepository` med `insert`, `list(status)`, `get(id)`, `update_status(id, status)`. Returnerar `Ticket`-objekt, aldrig rader.
- **Alltid parametriserade frågor** (`?`). Bygg aldrig SQL med f-strängar eller `+`.
- Varje skrivning i en transaktion: `with conn:` – vid fel rullas allt tillbaka, så att tidigare data är oförändrad (K7).
- `sqlite3.Error` fångas i repositoryt och kastas om som `StorageError` (med originalet som `__cause__` för loggning).
- Sortering: `ORDER BY created_at DESC, id DESC`.
- `created_at` lagras som `YYYY-MM-DDTHH:MM:SSZ` i UTC.

## Konfiguration

- Databasens sökväg från miljövariabeln `KSP_DB_PATH`, standard `backend/data/tickets.db`. Mappen `backend/data/` ligger i `.gitignore`.
- Ingen annan konfiguration behövs. Inga hemligheter.

## API-lagret: `app/api/`

Gäller oavsett ramverk:

- En fabriksfunktion `create_app(db_path: Path | None = None)` i `main.py`, så att testerna kan starta appen mot en egen databas.
- Routes är tunna: läs in, anropa servicen, returnera. Ingen SQL och inga affärsregler här.
- Enum-fält tas emot som `str` och valideras av servicen, så att felmeddelandena följer vårt format och inte ramverkets standardformat.
- Domänfel översätts på **ett** ställe (felhanterare/middleware) till felformatet i [arkitektur.md](arkitektur.md#felformat): `ValidationError` → 422, `TicketNotFoundError` → 404, `StorageError` → 503, övrigt → 500. Ramverkets egna valideringsfel, t.ex. felaktig JSON, ska också följa samma format.
- CORS tillåts bara för Vites utvecklingsserver (`http://localhost:5173`).

Ramverksspecifika konventioner (routing, scheman, testklient): **fylls i när Danielle valt ramverk.**

## Loggning

- `logging`-modulen, en logger per modul: `logger = logging.getLogger(__name__)`.
- Logga `StorageError` och oväntade fel med `logger.exception(...)`. Logga aldrig hela ärendebeskrivningar eller kunduppgifter.
- Inga `print()` i applikationskoden.
