---
name: code-design
description: Teamet Jirigas gemensamma code-design för Kundserviceportalen (React + TypeScript-frontend, Python/FastAPI-backend, SQLite). Använd ALLTID innan du skriver, ändrar, granskar eller planerar kod, tester, API-endpoints, databasschema, komponenter eller styling i det här repot – även för små ändringar – så att alla teammedlemmar och deras AI-agenter följer samma struktur, namngivning, felhantering och design.
---

# Code-design för Kundserviceportalen

Den här skillen är teamets gemensamma kontrakt. Fem personer arbetar på olika datorer, med olika erfarenhet och i olika delar av projektet. Koden ska ändå se ut som om en person skrivit den. När du är osäker: följ reglerna här framför egna vanor, och framför mönster du sett i andra projekt.

Kraven finns i [docs/kravspecifikation.md](../../../docs/kravspecifikation.md) (K1–K8, Q1–Q4) och testerna i [docs/verifieringsplan.md](../../../docs/verifieringsplan.md) (T01–T16, M01–M07). Skillen ersätter dem inte – den beskriver *hur* kraven byggs.

## Arbetsgång för agenten

1. Ta reda på vilket krav-ID (K1–K8) och vilka test-ID:n (T/M) uppgiften gäller. Fråga om det är oklart.
2. Läs relevant referensfil nedan innan du skriver kod i den delen.
3. Följ mappstrukturen och lagerindelningen exakt. Skapa inte nya toppmappar, lager eller beroenden utan att fråga användaren.
4. Skriv eller uppdatera tester i samma ändring som koden (se [references/tester.md](references/tester.md)).
5. Kör linter, formatterare och tester innan du säger att något är klart. Rapportera faktiskt utfall – påstå aldrig att tester passerar om de inte körts.
6. Uppdatera testlänkar i verifieringsplanen och kommandon i README när de ändras.

## Referensfiler – läs den som gäller din uppgift

| Arbetar du med … | Läs |
|---|---|
| Mappstruktur, domänmodell, API-kontrakt, felformat | [references/arkitektur.md](references/arkitektur.md) |
| React, TypeScript, komponenter, hooks, API-klient | [references/frontend.md](references/frontend.md) |
| Python, FastAPI, service-lager, SQLite | [references/backend.md](references/backend.md) |
| Vitest, pytest, testdata, testlagring | [references/tester.md](references/tester.md) |
| Färger, layout, tillgänglighet, UI-texter | [references/ui-design.md](references/ui-design.md) |

## Grundregler som gäller överallt

**Språk**
- All kod – variabler, funktioner, typer, filer, tabeller, kolumner, API-fält – på **engelska**.
- All text som användaren ser – etiketter, knappar, felmeddelanden, tomlägen – på **svenska**.
- Kommentarer, commit-meddelanden och PR-texter på **svenska**.
- Använd ordlistan i [references/arkitektur.md](references/arkitektur.md#ordlista). Hitta inte på synonymer (`case`, `issue`, `errand` …) – det heter alltid `ticket`.

**Ett ställe för varje sanning**
- Tillåtna värden (kategori, prioritet, status) och längdgränser definieras på exakt ett ställe per sida: `backend/app/domain/ticket.py` och `frontend/src/domain/ticket.ts`. Ändras en regel ändras båda i samma PR, med tester.
- Svenska visningsnamn för enum-värden finns bara i `frontend/src/domain/ticket.ts` och felmeddelanden bara i `backend/app/domain/errors.py`.
- Backend är alltid den som avgör (K2: reglerna gäller även om gränssnittet kringgås). Frontendens validering är bara snabb återkoppling.

**Fel får aldrig se ut som framgång (K7)**
- Visa aldrig "Sparat" eller uppdatera listan förrän backend svarat med lyckat resultat. Ingen optimistisk uppdatering.
- Fånga aldrig ett fel och låt det försvinna. Antingen hanteras det och visas för användaren, eller så skickas det vidare.
- Formulärvärden ska finnas kvar efter ett misslyckat anrop.

**Håll det litet**
- En funktion gör en sak. En komponent eller modul som växer över ungefär 200 rader delas upp.
- Lägg inte till bibliotek utan att fråga teamet. Standardbiblioteket och det som står i referensfilerna räcker för det kraven kräver.
- Bygg inte för framtida funktioner som inte finns i kravspecifikationen (inloggning, roller, integrationer, AI-funktioner ingår inte).

**Bara påhittade uppgifter**
- Testdata, seed-data och exempel använder påhittade namn som "Anna Exempel" eller "Erik Testsson". Aldrig riktiga personuppgifter, e-postadresser eller telefonnummer.
- Inga hemligheter eller databasfiler i git.

## Git och PR

- Branch per uppgift: `feat/k1-registrera-arende`, `fix/k7-lagringsfel-status`, `test/t04-langdgranser`, `docs/readme-korning`.
- Commits enligt Conventional Commits med svensk beskrivning: `feat: lägg till statusfilter (K8)`, `test: gränsfall för rubriklängd (T04)`. Ange krav- eller test-ID när det finns.
- En PR gäller ett krav eller en sammanhängande del. Beskrivningen anger krav-ID, test-ID, hur det verifierats och faktiska testresultat.

## Innan du säger att du är klar

- [ ] Koden ligger i rätt mapp och rätt lager enligt arkitekturen.
- [ ] Namn följer ordlistan och namngivningsreglerna.
- [ ] Felvägar är hanterade och ger svenska, begripliga meddelanden.
- [ ] Tester finns för happy path, error path och gränsfall, med test-ID i namnet.
- [ ] `npm run lint`, `npm run test`, `ruff check`, `ruff format --check` och `pytest` har körts, och utfallet redovisas som det faktiskt blev.
- [ ] UI följer färgtokens och tillgänglighetsreglerna.
