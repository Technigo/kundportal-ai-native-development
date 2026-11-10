# Registrera ärende – formuläret (K1, K2, K7)

**Branch:** `feature/create-ticket`. **Status:** komponenten är byggd och testad isolerat. Den är **inte** kopplad till `App.tsx` ännu; det görs efter samordning med Daniel. Ingen mänsklig kodgranskning och ingen test mot riktig backend är dokumenterad.

## Funktion

`TicketForm` låter en handläggare registrera ett ärende med Kund-ID, Kundnamn, Rubrik, Beskrivning, Kategori och Prioritet. Alla fält är obligatoriska. Id, status och skapandetid sätts av backend och skickas aldrig av klienten.

## Underlag

- [Kravspecifikation](../../kravspecifikation.md): K1 (registrera), K2 (validera), K7 (lagringsfel), avsnitt 4 (fältregler).
- [API-kontrakt](../../api-kontrakt.md): `POST /api/tickets`, felformat, `storage_unavailable` och `save_outcome_unknown`.
- [Verifieringsplan](../../verifieringsplan.md): T01–T05 och T16 (frontenddelen av trimning och längd), M01 och M02.
- Code-design: [SKILL.md](../../../.claude/skills/code-design/SKILL.md), [frontend.md](../../../.claude/skills/code-design/references/frontend.md), [ui-design.md](../../../.claude/skills/code-design/references/ui-design.md) och [tester.md](../../../.claude/skills/code-design/references/tester.md).

## Filer (alla nya utom `api/tickets.ts`)

| Fil | Uppgift |
|---|---|
| `frontend/src/features/tickets/TicketForm.tsx` och `.module.css` | Formuläret, fältfel, teckenräknare, `Alert` och bekräftelse |
| `frontend/src/features/tickets/useCreateTicket.ts` | Anropar `createTicket`, håller `isSaving` och `error`, skickar aldrig om automatiskt |
| `frontend/src/api/tickets.ts` | `createTicket` (`POST /tickets`) via `request`, tillagd i den befintliga filen bredvid `listTickets` |
| `frontend/src/domain/text.ts` | `WHITE_SPACE`, `trimText`, `textLength`, `TEXT_LIMITS` |
| `frontend/src/domain/fieldErrors.ts` | Svenska fältfel och klientvalidering |
| `TicketForm.test.tsx`, `text.test.ts` | Tester |

Återanvänds utan ändring från Daniels del: `api/client.ts` (`request`, `ApiError`), `domain/ticket.ts` (typer, värden, visningsnamn) och `styles/tokens.css`.

## Plats i UX-flödet

Handläggaren klickar "+ Registrera ärende" → fyller i formuläret → "Spara ärende" → bekräftelse → ärendets detaljvy (K5). Vid fel stannar handläggaren kvar i formuläret med allt ifyllt.

## Felhantering

| Situation | Resultat |
|---|---|
| Klientvalidering misslyckas | Fältfel vid fältet, inget anrop skickas |
| `422 validation_error` | Fältfel vid rätt fält, inmatningen finns kvar |
| `503 storage_unavailable` | "Ändringen kunde inte sparas. Försök igen." |
| `500 save_outcome_unknown` eller `network_error` | "Det gick inte att bekräfta att ändringen sparades …", inget automatiskt nytt försök |

Knappen är inaktiverad medan anropet pågår. Formuläret rensas bara efter lyckat svar.

## Koppla in komponenten (görs senare, tillsammans med Daniel)

```tsx
<TicketForm onCreated={(ticket) => /* öppna detaljvyn för ticket.id */} onCancel={() => /* tillbaka till listan */} />
```

`App.tsx` behöver en vy-växling och en knapp "+ Registrera ärende". `TEXT_LIMITS` ligger i `domain/text.ts` för att inte röra `domain/ticket.ts`; den kan flyttas dit vid integrationen.

## Verifiering

Kör från `frontend/`:

```bash
npm test
npm run build
```

Senaste lokala körning: 5 testfiler och 45 tester godkända, `npm run build` utan fel. Testerna mockar `src/api/tickets`.

### Manuella kontroller mot riktig backend, 2026-11-05

Lokalt: MySQL via Docker Compose, FastAPI på port 8000 och Vite på port 5173. Formuläret kördes på en lokal testsida som inte checkas in, eftersom komponenten inte är kopplad till `App.tsx`. Kontrollerna utfördes av en person och är inte granskade av någon annan.

| Kontroll | Resultat |
|---|---|
| M01 (registreringsdelen): giltigt ärende | Godkänd. `POST /api/tickets` gav `201`, svaret hade `status: "new"` och `created_at` med sex decimaler, formuläret rensades och bekräftelsen "Ärendet har sparats som #N" visades. Kund-ID med blanksteg runt sparades trimmat. |
| M02: fel och gränser | Godkänd. Tomt formulär, enbart blanksteg, rubrik på 100 respektive 101 tecken och emoji i räknaren fungerade som förväntat och ifyllda fält fanns kvar. Att inget anrop skickades vid blockerat försök styrks av backendens logg: inga `422` från formuläret, bara `201`-anrop. Webbläsarens Network-flik användes inte. |
| K7: lagringsfel | Godkänd för `storage_unavailable`. Med MySQL stoppad gav `POST` `503`, formuläret visade "Ändringen kunde inte sparas. Försök igen.", visade varken bekräftelse eller JSON och behöll inmatningen. Inget nytt anrop skickades automatiskt. Efter `docker compose start mysql` sparades samma uppgifter som ärende #11. |

Resten av M01 (listfält, detaljfält och väg tillbaka till listan) och K1-delen "åtkomst via lista och detaljer" återstår tills formuläret är inkopplat.

Begränsningar: `save_outcome_unknown` och `network_error` är bara verifierade med mockade svar i `TicketForm.test.tsx`; de kan inte framkallas på ett säkert sätt från webbläsaren. Det finns ingen mänsklig kodgranskning och komponenten är ännu inte integrerad i `App.tsx`.
