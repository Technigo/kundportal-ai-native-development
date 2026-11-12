# Agentuppdrag: gemensam felhantering för API-anrop (KSP-79)

> **Godkänt av Amalia 2026-11-09, före körningen.** Utkastet skrevs av AI på min begäran, utifrån
> mina beslut 2026-11-08. Valen under "Mina val" är mina. Agenten körs i en egen session med det här
> uppdraget som enda instruktion, på en gren från `main` efter att PR #107 (felmeddelanden i UI)
> mergades. Avsnitten "Hinder och frågor" och "Min granskning" fylls i efter körningen.

---

## Id i det här uppdraget

| Id | Vad det gäller |
| --- | --- |
| KSP-79 | Det här uppdraget: felhanteringen för API-anrop på ett ställe |
| KSP-38 | Felmeddelanden i UI, där felhanteringen byggdes (PR #107) och fynd 6 i Mustafas granskning ledde till KSP-79 |
| KSP-37 | Tidslinjen i detaljvyn (PR #109), med `fetchHistory` |
| HIST-14 | Fel på svenska för status och historik, utan tekniska detaljer |
| CORE-16 | Fel på svenska, aldrig stacktrace, SQL eller engelska fältnamn |

## 1. Mål

Felhanteringen för API-anrop finns på ett ställe. I dag gör `toTicketResult` i
`frontend/src/api/tickets.ts` och `fetchTickets` i `frontend/src/pages/TicketListPage.tsx` samma sak:
`try`, kontroll av `response.ok`, `errorDetail(response) ?? messageWithoutDetail(response.status)`, och
`catch` som ger `BACKEND_UNREACHABLE`. Efter uppdraget finns den logiken bara i en generisk funktion,
`toResult<T>`, och **inget beteende ändras**: alla befintliga tester går igenom utan att någon testfil
ändras (KSP-79 AC3).

## 2. Läs först

1. `AGENTS.md` och `docs/ai/misstag-amalia.md`.
2. KSP-79 i Linear: AC1–AC3.
3. `docs/specs/SPEC-felmeddelanden-och-tidslinje.md`, avsnitt 4 (reglerna för felmeddelanden). Finns
   filen inte på grenen är PR #112 inte mergad än. Läs den då med
   `git show origin/docs/ksp-38-spec-felmeddelanden-tidslinje:docs/specs/SPEC-felmeddelanden-och-tidslinje.md`.
4. `docs/api-konventioner.md`, avsnitt 2 (felformatet).
5. Koden: `frontend/src/api/errors.ts` (`BACKEND_UNREACHABLE`, `UNEXPECTED_ERROR`,
   `messageWithoutDetail`, `errorDetail`), `frontend/src/api/tickets.ts` (`TicketResult`,
   `toTicketResult` och de tre anropen) och `fetchTickets` i `frontend/src/pages/TicketListPage.tsx`.
6. Testerna som skyddar beteendet: `frontend/src/api/errors.test.ts`,
   `frontend/src/pages/TicketListPage.test.tsx`, `frontend/src/pages/ticket-detail-page.test.tsx`,
   `frontend/src/pages/ticket-status-change.test.tsx`, `frontend/src/components/create-ticket-form.test.tsx`
   och `frontend/src/App.test.tsx`.

**Det här gäller (Amalias beslut):**

- **En generisk `toResult<T>`** i en ny fil, `frontend/src/api/result.ts`. Den tar ett anrop
  (`Promise<Response>`) och ger antingen data eller ett fel med text och eventuell statuskod.
- **`fetchTickets` flyttas till `frontend/src/api/tickets.ts`** och använder `toResult`.
- **`TicketResult` behåller sin form** (`{ state: "ok"; ticket }` eller `{ state: "error"; message;
  httpStatus? }`), så att detaljvyn, formuläret och statusbytet inte behöver ändras.
- **Reglerna för texten är oförändrade:** `detail` som det är, annars `messageWithoutDetail(status)`,
  och vid inget svar `BACKEND_UNREACHABLE`.
- **`fetchHistory` (tidslinjen) ingår inte.** Den visar medvetet bara "error", utan `detail`.

## 3. Uppgift

Testerna finns redan. Agenten skriver **ingen** testkod och ändrar ingen testfil. Stanna vid varje
kontrollpunkt (avsnitt 5).

1. **Plan, utan kod.** Kör `pnpm test:run` i `frontend/` och visa nollpunkten (antal tester och
   filer, allt grönt). Beskriv sedan hur `toResult<T>` ser ut (signatur och typ för resultatet), hur
   `toTicketResult` och `fetchTickets` använder den, och vilka typer som flyttas.
2. **`toResult` och ärendeklienten.** Skapa `api/result.ts`, låt `toTicketResult` använda den och
   flytta `fetchTickets` till `api/tickets.ts`. Hela sviten grön.
3. **Listan.** `TicketListPage.tsx` importerar `fetchTickets` från `api/tickets.ts`, och den egna
   felhanteringen tas bort. `ListState` får behålla `loading`. Hela sviten grön, `pnpm lint` och
   `pnpm build` utan fel.
4. **Mutationer.** Amalia skriver ned sin gissning först. Kör sedan mutationerna L2 (listan visar
   webbläsarens fel), L3 (statuskoden läggs till meddelandet) och L4 (listan visar en tom lista vid fel)
   från `docs/verifiering.md` avsnitt 5 igen, nu mot `toResult`. Återställ varje fil från en sparad
   kopia, aldrig med `git checkout`. Visa vilka tester som föll.
5. **Rapport** enligt avsnitt 7.

## 4. Gränser

**Får röra (tre filer):**

- `frontend/src/api/result.ts`: ny fil, bara `toResult` och dess typer
- `frontend/src/api/tickets.ts`: `toTicketResult` och den flyttade `fetchTickets`. Inte `fetchHistory`
- `frontend/src/pages/TicketListPage.tsx`: bara att `fetchTickets` och dess typer tas bort och importeras
- Inga andra filer. Om en till behövs: stanna och fråga.

**Får inte:**

- Ändra, ta bort, hoppa över eller försvaga något test, eller röra någon testfil. Verkar ett test fel:
  stanna och fråga.
- Ändra någon text som användaren ser, eller reglerna i `api/errors.ts`.
- Ändra formen på `TicketResult`, eller detaljvyn, formuläret, statusbytet eller tidslinjen.
- Röra `fetchHistory` eller `components/ticket-history.tsx`.
- Lägga till beroenden, eller röra backend, `docs/` eller CI.
- Committa, pusha eller öppna PR. Det gör Amalia.

**Kodstil:** namn och kommentarer på engelska, svenska bara i texter som användaren ser. Kommentarer
som förklarar *varför*, och varje krav-id förklarat kort, t.ex.
`// KSP-38 AC2: no readable answer gives a fixed Swedish text, never an empty alert`.

## 5. Kontrollpunkter (agenten stannar och väntar på Amalia)

1. **Efter planen:** nollpunkten och planen. Ingen kod förrän Amalia har godkänt.
2. **Efter `toResult` och ärendeklienten:** diffen och `pnpm test:run`.
3. **Efter listan:** hela diffen, `pnpm test:run`, `pnpm lint` och `pnpm build`.
4. **Före mutationerna:** Amalias gissning.
5. **Före varje fil utanför avsnitt 4, eller om ett test verkar fel:** stanna och fråga.

## 6. Klart när

- `pnpm test:run` ger samma antal gröna tester som vid nollpunkten, och `git diff --stat` visar ingen
  testfil.
- `pnpm lint` och `pnpm build` ger inga fel.
- Mutationerna L2–L4 fångas fortfarande.
- Amalia har läst hela diffen och kört testerna själv.
- Amalia har startat projektet och sett att listan laddas, och att den visar "Kundserviceportalen
  svarar inte just nu. Försök igen om en stund." när backenden är avstängd.

## 7. Rapport från agenten

- Vilka filer som ändrades och varför
- Testutskrift före och efter, med antal
- Mutationerna: vilka tester som föll för var och en
- Varje fråga eller hinder under arbetet och hur det löstes
- Vad den inte gjorde och varför
- Antaganden den gjorde

## Mina val

1. En generisk `toResult<T>` i `api/result.ts`, i stället för en egen variant för listor (2026-11-08).
2. `fetchHistory` ingår inte, eftersom den har andra regler och ligger i PR #109 (2026-11-08).
3. Uppdraget körs när #107 är mergad, på en gren från `main` (2026-11-08).
4. Agenten körs i en egen Claude Code-session, med uppdraget som enda instruktion (2026-11-08).
5. Inga testfiler ändras. Testerna från #107 skyddar beteendet (KSP-79 AC3).

---

## Hinder och frågor

Körningen 2026-11-10, på `1f4da6f` (grenen efter att `main` slogs in). Agenten stannade vid alla
fyra kontrollpunkterna. Nollpunkt och slut: 11 filer, 101 passed. Inga hinder stoppade arbetet.

| # | Fråga eller hinder | Hur det löstes |
| --- | --- | --- |
| 1 | `toResult` ger `httpStatus` vid alla felsvar. Ska listans fel få fältet, eller ska `fetchTickets` ta bort det? Listan läser bara `message`, så användaren märker ingen skillnad | Amalia valde att behålla `httpStatus` (alternativ ett). `fetchTickets` och `toTicketResult` ser då likadana ut |
| 2 | Specen `SPEC-felmeddelanden-och-tidslinje.md` fanns inte på grenen, eftersom PR #112 (specen för felmeddelanden och tidslinjen) inte är mergad | Avsnitt 4 lästes från `origin/docs/ksp-38-spec-felmeddelanden-tidslinje`, som avsnitt 2 i uppdraget säger |
| 3 | Uppdraget anger L3 som `` `${detail} (${status})` ``, men i `toResult` kan `detail` vara `null` | Agenten lade statuskoden till hela meddelandet, även den fasta texten: `` `${detail ?? messageWithoutDetail(status)} (${status})` `` |
| 4 | Första körningen av typkontrollen i kontrollpunkt 2 doldes av npm-meddelanden | `tsc -b` kördes igen med `pnpm exec`. Exit 0 |
| 5 | För att den nya filen `result.ts` skulle synas i diffen markerade agenten den med `git add -N` | Markeringen togs bort direkt med `git reset`. Inget stagades eller committades |

**Mutationerna mot `toResult`.** Amalia gissade före körningen. Varje fil återställdes från en
sparad kopia, kontrollerad med sha1, aldrig med `git checkout`.

| Mutation | Gissning | Föll | Jämfört med 2026-11-05 |
| --- | --- | --- | --- |
| L2: listan visar webbläsarens fel (`String(e)` i `catch` i `toResult`) | 6 | 5 av 101: ett nätverksfelstest per vy (listan, `App.test.tsx`, detaljvyn, statusbytet, formuläret) | 2 föll. Mutationen når nu alla fyra vyerna. Tidslinjen klarar sig, eftersom `fetchHistory` har en egen `catch` |
| L3: statuskoden läggs till meddelandet i `toResult` | Alla | 10 av 101, i listan, formuläret, detaljvyn, statusbytet och tidslinjen. Bland annat `HIST-14: status error shows no status code` | 4 av 32 föll. Tidslinjens tester föll, att döma av namnen, på detaljvyns felmeddelande och inte på `fetchHistory` |
| L4: listan visar en tom lista vid fel (felgrenen i `fetchTickets`) | 1 | 3 av 101: `KSP-38: list server error shows the message from the API`, `HIST-14: list network error shows no technical words` och testet i `App.test.tsx` | 1 föll. `toResult` ger nu felsvar och nätverksfel som samma `error`, så en rad når båda fallen |

**Gjordes inte under körningen:** ingen commit, push eller PR. Resultaten fördes inte in i `docs/verifiering.md`,
eftersom `docs/` låg utanför gränserna. Projektet startades inte. Det är Amalias kontroll.

**Gjordes efter körningen:** jag committade koden (`7c9e1a3`), och "Hinder och frågor" och
mutationerna L2–L4 fördes in i `docs/verifiering.md`, avsnitt 5 (`ee07e02`). Därefter provade jag
i webbläsaren och körde testerna själv (se "Min granskning").

## Min granskning

| Del av diffen | Accepterade / ändrade / avvisade | Varför |
| --- | --- | --- |
| Planen (kontrollpunkt 1): en generisk `toResult<T>` i `api/result.ts`, som `toTicketResult` och `fetchTickets` använder | Accepterade | Den följde mitt val (en generisk funktion) och höll sig inom de tre filerna i uppdraget |
| `api/result.ts`: tre vägar, data, `detail` eller `messageWithoutDetail(status)`, och `BACKEND_UNREACHABLE` i `catch` | Accepterade | Samma regler som förut, nu på ett ställe. Testerna är oförändrade och gröna, och mutationerna fångas av fler tester än förut |
| `api/tickets.ts`: `toTicketResult` via `toResult`, och `fetchTickets` flyttad hit. `fetchHistory` orörd | Accepterade | All hämtning av ärenden ligger nu i API-lagret. `fetchHistory` rördes inte, eftersom den har andra regler (tidslinjen visar sitt eget meddelande) |
| `TicketListPage.tsx` (Mustafas): egen `try/catch` borttagen, importerar `fetchTickets` | Accepterade | Sidan visar bara det den får, och felhanteringen ligger i API-lagret. Ändringen nämns för Mustafa i PR:en |
| Listans fel behåller `httpStatus` (fråga 1) | Accepterade alternativ ett | Minsta ändringen. Att ta bort fältet hade varit en extra ändring utan nytta för användaren, eftersom listan bara visar texten |
| L3 gjordes på hela meddelandet, inte bara `detail` (fråga 3) | Accepterade | Det är samma fel, en statuskod som läcker ut till användaren, anpassat till att `detail` kan saknas i `toResult`. Agenten skrev det själv under antaganden |

**Testkörningar:** nollpunkt och slut 101 passed (11 filer), och ingen testfil ändrad. Jag körde
hela sviten själv efter körningen (`pnpm --dir frontend test:run`): 11 filer, 101 passed. `pnpm lint`
och `pnpm build` utan fel.

**Mina gissningar:** se tabellen över mutationerna ovan. L2 och L3 stämde i princip: felet slog mot
alla vyer som går genom `toResult`, men bara de tester som kontrollerar feltexten föll. L4 överraskade
mig: jag trodde att bara ett test skulle falla, men eftersom `toResult` nu gör om både felsvar och
nätverksfel till samma sorts fel slog en enda ändrad rad mot båda fallen i listan.

**Mitt manuella prov (2026-11-10, port 5173):** listan laddas, jag skapade ett ärende i formuläret,
och med backenden avstängd visar listan "Kundserviceportalen svarar inte just nu. Försök igen om en
stund."

**Vad agenten gjorde fel eller missade:**

- Rapporten sa att tidslinjens tester i L3 föll på detaljvyns felmeddelande "att döma av namnen",
  utan att det var kontrollerat. Agenten var ärlig om det, och det kontrollerades efteråt i
  testkoden: testerna letar efter exakt "Ärendet finns inte." och "Statusen kunde inte ändras.
  Försök igen.", som inte hittas med statuskoden efter.

**Commits:** `9d7f644` (uppdraget före körningen), `7c9e1a3` (koden), `ee07e02` ("Hinder och
frågor" och mutationerna).
