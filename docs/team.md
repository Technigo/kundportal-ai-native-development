# Team

## Members

- Marie Flem Honningdalnes
- Alexandra Petersson
- Ariadna Villar
- Jessica Swahn

## Working agreement

We share responsibility for the Customer Service Portal (Kundserviceportalen) across the 4-week examination period.

- **Shared ownership.** Every member can read, run, and explain the whole codebase. Components have a named owner (see below), but no one works in isolation.
- **One fork, one `main`.** We work in the team fork. Smaller tasks go on short-lived branches and are reviewed in internal PRs to our own `main`. The continuous PR from fork `main` to the course repo `main` stays open and is not merged.
- **Traceable reviews.** Each internal PR records who reviewed it, what was checked, and what changed as a result.
- **Weekly status.** We update `docs/status/week-N.md` each week with the expected outcome, what is done, and what is open or uncertain.
- **AI use.** AI agents may draft code, tests, and docs, but a human owns and reviews every change. We record which tasks involved an AI agent and what was verified by hand.
- **Fake data only.** No real customer data in the repo, in seeds, or in prompts.
- **Communication.** Blockers are raised early. Decisions that affect the architecture are written down in a new md-file for each descision `docs/decisions/` Decisions should follow structure in `docs/decisions/README.md` .

## Requirements and responsibility

The solution requirements from the examination assignment.

Each member owns at least one traceable technical requirement and reviews at least one classmate's change. Every owner writes the automated tests for their own requirement.

| Requirement | Owner | Reviewer |
|---|---|---|
| Register a new ticket and validate required information | Alexandra Petersson | Jessica Swahn |
| Handle at least one invalid use case with a clear message to the user | Alexandra Petersson | Jessica Swahn |
| Persist tickets so they remain after the application restarts | Ariadna Villar | Marie Flem Honningdalnes |
| Show a list of tickets and the details of a selected ticket | Marie Flem Honningdalnes | Alexandra Petersson |
| Change the status of a ticket | Jessica Swahn | Ariadna Villar |
| Add Internal Notes | Marie Flem Honningdalnes | Alexandra Petersson |
| Verify central behaviour with automated tests covering happy paths and relevant error paths | Jessica Swahn | Ariadna Villar |
| Can be run and demonstrated by someone else using our instructions | Ariadna Villar | Marie Flem Honningdalnes |

---

# Team (svensk översättning)

## Medlemmar

- Marie Flem Honningdalnes
- Alexandra Petersson
- Ariadna Villar
- Jessica Swahn

## Arbetsöverenskommelse

Vi delar ansvaret för Kundserviceportalen under den fyra veckor långa examinationsperioden.

- **Delat ägarskap.** Alla medlemmar kan läsa, köra och förklara hela kodbasen. Varje komponent har en namngiven ägare (se nedan), men ingen arbetar isolerat.
- **En fork, en `main`.** Vi arbetar i teamets fork. Mindre uppgifter görs på kortlivade brancher och granskas i interna PR:er mot vår egen `main`. Den löpande PR:en från forkens `main` till kursrepots `main` hålls öppen och mergas inte.
- **Spårbara granskningar.** Varje intern PR dokumenterar vem som granskade den, vad som kontrollerades och vad som ändrades som en följd av granskningen.
- **Veckostatus.** Vi uppdaterar `docs/status/week-N.md` varje vecka med förväntat resultat, vad som är klart och vad som är öppet eller osäkert.
- **AI-användning.** AI-agenter får ta fram utkast till kod, tester och dokumentation, men en människa äger och granskar varje ändring. Vi dokumenterar vilka uppgifter som involverade en AI-agent och vad som verifierades manuellt.
- **Endast påhittad data.** Ingen riktig kunddata i repot, i seed-data eller i promptar.
- **Kommunikation.** Hinder lyfts tidigt. Beslut som påverkar arkitekturen skrivs ner i en ny md-fil per beslut i `docs/decisions/`. Besluten ska följa strukturen i `docs/decisions/README.md`.

## Komponentägarskap och spårning av AI-agentuppgifter

Platshållare: fylls i när arbetet fördelas.

| Komponent / uppgift | Ägare | Granskare | AI-agent som användes (verktyg, uppgift) | Verifierad av | Status |
|---|---|---|---|---|---|
| Projektuppsättning och grundstruktur | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Databasschema (Drizzle) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Registrering av ärenden (UI + serverlogik) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Ärendelista och detaljvy | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Statushantering | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Tester (Vitest) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Dokumentation | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Specifikation och acceptanskriterier | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Validering och felmeddelanden till användaren | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Kompletterande funktion (välj och specificera först, t.ex. interna anteckningar, tilldelning, sök/filter eller ärendehistorik) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Projektets AI-instruktioner och gemensamt AI-arbetsflöde | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Återanvändbar/automatiserad AI-uppgift (gemensam instruktion eller automatisering) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Tekniska beslut (`docs/decisions/`) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Kamratgranskning: varje medlem granskar minst en klasskamrats ändring | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Veckostatus vecka 6–8 (`docs/status/`) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Kända begränsningar, risker och vidareutveckling | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Förberedelse inför demo vecka 8 | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |
| Markera slutversion i den löpande PR:en ("Slutversion för examination") | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Ej påbörjad |

## Krav och ansvar

Lösningskraven från examinationsuppgiften. Förslag: ska bekräftas av teamet.

Varje medlem äger minst ett spårbart tekniskt krav och granskar minst en klasskamrats ändring. Varje ägare skriver de automatiserade testerna för sitt eget krav.

| Krav | Ägare | Granskare |
|---|---|---|
| Registrera ett nytt ärende och validera obligatorisk information | Alexandra Petersson | Jessica Swahn |
| Hantera minst ett ogiltigt användningsfall med ett tydligt meddelande till användaren | Alexandra Petersson | Jessica Swahn |
| Spara ärenden så att de finns kvar efter att applikationen startats om | Ariadna Villar | Marie Flem Honningdalnes |
| Visa en lista med ärenden och detaljerna för ett valt ärende | Marie Flem Honningdalnes | Alexandra Petersson |
| Ändra status på ett ärende | Jessica Swahn | Ariadna Villar |
| Lägga till interna anteckningar | Jessica Swahn | Alexandra Petersson |
| Verifiera central funktionalitet med automatiserade tester som täcker lyckade flöden och relevanta felflöden | Jessica Swahn | Ariadna Villar |
| Kan köras och demonstreras av någon annan med hjälp av våra instruktioner | Ariadna Villar | Marie Flem Honningdalnes |
