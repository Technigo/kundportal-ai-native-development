## Läget i dag

- Statusarna finns redan: `ticketStatuses = ["open", "in_progress", "closed"]` i `src/tickets/ticketSchema.ts`. Kolumnen `tickets.status` begränsas till dessa värden och har `"open"` som standardvärde.
- Det finns ingen detaljsida för ärenden. AC4.1 är "Planned" och under `src/app/(portal)/tickets/` finns bara `page.tsx` och `new/`.
- Det finns ingen historiktabell, och ingen inloggning, så systemet vet inte vem som är handläggare.
- Briefen säger bara att man kan ändra status "between" de tre värdena. Vilka övergångar som är tillåtna står inte någonstans.

## 1. Utkast till specifikation

**Vad handläggaren gör:** öppnar ett ärende, ser dess nuvarande status, väljer en ny status och sparar. Den nya statusen syns sedan på ärendet och i listan.

**Statusar:** `open` (Öppen), `in_progress` (Pågår), `closed` (Stängd).

**Mitt förslag på övergångar** (behöver bekräftas, se fråga 1):

| Från \ Till | open | in_progress | closed |
|---|---|---|---|
| open | – | ✅ | ✅ |
| in_progress | ✅ | – | ✅ |
| closed | ✅ (återöppna) | ❌ | – |

Regler:
- Att "ändra" till samma status som redan gäller avvisas, eller blir en no-op (fråga 4).
- Statusen valideras på servern, och okända värden avvisas (AC5.3).

## 2. Acceptanskriterier (utkast)

- **AC-S1 (happy path):** Givet ett ärende med status `open`, när handläggaren väljer `in_progress` och sparar, så sparas den nya statusen och visas på ärendet och i ärendelistan.
- **AC-S2 (error path, ogiltigt värde):** Givet ett ärende, när servern tar emot statusen `"resolved"` eller ett tomt värde, så sparas ingenting, ett felmeddelande visas och ärendets status är oförändrad.
- **AC-S3 (error path, otillåten övergång):** Givet ett ärende med status `closed`, när servern tar emot `in_progress`, så avvisas ändringen med ett felmeddelande och statusen förblir `closed`.
- **AC-S4 (error path, ärendet finns inte):** När en statusändring skickas för ett ärende-id som inte finns, så ändras ingenting och handläggaren får ett "hittades inte"-svar.
- **AC-S5 (historik, om den ingår, se fråga 2):** Varje lyckad statusändring sparas med från-status, till-status och tidpunkt och visas på ärendet, nyast först.

## 3. Uppdelning i små steg (vart och ett test-först enligt `ticket-change`)

1. **Övergångsregler (ren funktion):** `canTransition(from, to)` och ett zod-schema för statusändring i `ticketSchema.ts`. Testas med Vitest.
2. **Repository:** `getTicket(db, id)` och `changeTicketStatus(db, id, to)` i `ticketRepository.ts`. Den senare kontrollerar övergången och hanterar "finns inte". Testas med Vitest mot test-db.
3. **Server action:** `changeStatus` i `tickets/actions.ts` som validerar indata, anropar repository och returnerar fältfel. Testas med Vitest.
4. **UI:** ett statusformulär där man bara kan välja tillåtna mål, plus en enkel detaljsida `tickets/[id]` (fråga 3). Komponenttest och sedan ett Playwright-test för AC-S1.
5. **(Om den ingår) Historik:** en ny tabell `ticket_status_changes` i `src/db/schema.ts`, där ni själva kör `npm run db:generate`. Repository skriver ärendet och historikraden i samma transaktion, och historiken visas på detaljsidan.
6. **Dokumentation:** uppdatera AC-status i `project-brief.md`, `verification.md` och `limitations.md`.

## Frågor innan jag går vidare

1. **Övergångar:** stämmer tabellen ovan? Ska det till exempel gå att gå direkt från `open` till `closed`, och ska `closed` kunna återöppnas? Eller får alla statusar byta till alla andra, vilket är den bokstavliga läsningen av AC5.1?
2. **Historik (AC5.2):** ingår den i det här arbetet, eller är det en separat leverans? Den kräver en schemaändring och en ny migration, som ni genererar själva.
3. **Var i UI:t:** detaljsidan (AC4.1) finns inte än. Ska jag ta med en minimal detaljsida, vänta på att någon annan bygger den, eller lägga statusbytet direkt i listan?
4. **Samma status:** ska ett "byte" till den status som redan gäller ge ett fel eller tyst ignoreras? Och ska det sparas i historiken?
5. **Vem ändrade:** det finns ingen inloggning. Ska historiken bara ha tidpunkt, eller ska vi spara ett handläggarnamn, till exempel ett fritextfält?