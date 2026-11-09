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

*(fylls i efter körningen)*

## Min granskning

*(fylls i efter körningen)*
