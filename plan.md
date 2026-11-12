# Kundserviceportalen — MVP-plan

## Val

- TypeScript, React/Vite, Express och SQLite; körs lokalt.
- Ärenden: skapa, lista, visa, statusändra och hantera intern anteckning.
- Statusar: Nytt, Pågående, Väntar på kund, Avslutat; alla övergångar tillåts.
- Kategorier: Konto, Fakturering, Tekniskt, Övrigt. Prioritet: Låg, Normal, Hög.
- Rubrik max 120 tecken, beskrivning max 2 000 och anteckning max 2 000. Obligatorisk text trimmas; tom anteckning raderas.
- Krav per feature med stabila ID:n; varje krav täcks av minst ett automatiserat test. Ett test kan täcka flera krav.
- Vitest, Supertest, React Testing Library och Playwright.
- Color Hunt-paletten med kontrastjustering vid behov; gemensamma UI-komponenter.
- Ingen inloggning, drift eller extern integration. Individuella tillägg är inte valda ännu.

## Delsteg

Varje delsteg verifieras och granskas. Vi pausar för godkännande innan nästa startar; godkända delsteg committas.

| # | Delsteg | Status |
|---|---|---|
| 1 | TypeScript-skelett, lokal start, README och API health check | Klart — `e7012eb6` |
| 2 | Delade Copilot-instruktioner och TDD-/UI-skills | Klart — `55d597fa` |
| 3 | Vertikala featuretickets med krav-ID, acceptanskriterier och testmappning | Klart — `25805521` |
| 4 | Skapa ärende: UI, validering, API, SQLite och kravmärkta tester | Klart — `e0ec5616` |
| 5 | Lista ärenden: nyast först, tomläge och felhantering | Klart |
| 6 | Visa ärendedetalj; testa befintligt och saknat ärende | Klart — verifierat och godkänt efter granskning |
| 7 | Ändra status och verifiera beständig uppdatering | Klart — verifierat och godkänt efter granskning |
| 8 | Lägga till/redigera/radera intern anteckning | Klart — verifierat och godkänt för commit |
| 9 | Tillgänglighet och fokusflöden | Klart |
| 10 | Gemensamma UI-komponenter, konsekventa felbesked och visuell kontroll | Återstår |
| 11 | Playwright-flöden, verifieringsmatris och överlämning | Återstår |

Tester skrivs före implementation inom varje feature. Varje krav-ID ska synas i minst ett testnamn eller testbeskrivning. `uppgift.md` lämnas orörd.
