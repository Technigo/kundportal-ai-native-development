---
name: code-design
description: Teamet Jirigas gemensamma code-design för Kundserviceportalen (React + TypeScript + Vite i frontend, FastAPI + SQLAlchemy + MySQL i backend, Vitest och pytest). Använd ALLTID innan du skriver, ändrar, granskar eller planerar kod, tester, API-endpoints, databasschema, migrationer, komponenter, styling eller dokumentation (.md) i det här repot – även för små ändringar – så att alla teammedlemmar och deras AI-agenter följer samma struktur, namngivning, felhantering och design.
---

# Code-design för Kundserviceportalen

Den här skillen är teamets gemensamma kontrakt. Fem personer arbetar på olika datorer, med olika erfarenhet och i olika delar av projektet. Koden ska ändå se ut som om en person skrivit den. När du är osäker: följ reglerna här och mönstren i befintlig kod framför egna vanor.

## Källor – i den här ordningen

1. [docs/kravspecifikation.md](../../../docs/kravspecifikation.md) – produktregler (K1–K8, Q1–Q7). Går alltid först.
2. [docs/api-kontrakt.md](../../../docs/api-kontrakt.md) – endpoints, JSON-fält, maskinvärden, statuskoder och felformat. **Enda källan för API:t.** Skillen upprepar inte kontraktet, så att de inte kan glida isär.
3. [docs/verifieringsplan.md](../../../docs/verifieringsplan.md) – vad som ska testas (T01–T16, M01–M07) och faktiska resultat.
4. Den här skillen – *hur* koden skrivs.

Säger skillen något annat än 1–3 gäller dokumenten, och skillen ska rättas i samma PR.

## Öppna beslut

Inte fastställt. Hitta inte på ett eget val – fråga användaren eller lämna en tydlig `TODO` med hänvisning hit.

| Beslut | Läge |
|---|---|
| API-kontraktet | Danielles backendbaslinje. Frontendgruppen granskar innan integration. |
| Linter för Python | Ingen vald. Följ PEP 8 och stilen i befintlig kod. |
| Lint-skript i frontend | `.oxlintrc.json` finns men inget `npm run lint`. Lägg inte till ett utan att fråga. |
| Servicelager i backend | Inte nu. Följ befintlig platt struktur, se [references/backend.md](references/backend.md). Kan införas senare om routes blir för stora. |

När ett beslut fattas: uppdatera tabellen och berörd referensfil i samma PR.

## Arbetsgång för agenten

1. Ta reda på vilket krav-ID (K1–K8) uppgiften gäller och vilka tester i verifieringsplanen som berörs. Fråga om det är oklart.
2. Läs relevant referensfil nedan, och berörd del av API-kontraktet, innan du skriver kod.
3. Följ befintlig mappstruktur. Skapa inte nya toppmappar, lager eller beroenden utan att fråga användaren.
4. Skriv eller uppdatera tester i samma ändring som koden (se [references/tester.md](references/tester.md)).
5. Kör testerna och typkontrollen innan du säger att något är klart. Rapportera faktiskt utfall – påstå aldrig att tester passerar om de inte körts, och säg uttryckligen om MySQL-integrationstesterna inte kunde köras.
6. Uppdatera testlänkar och resultat i verifieringsplanen och kommandon i README när de ändras.

## Referensfiler – läs den som gäller din uppgift

| Arbetar du med … | Läs |
|---|---|
| Mappstruktur, ordlista, fältregler, var API-kontraktet finns | [references/arkitektur.md](references/arkitektur.md) |
| React, TypeScript, komponenter, hooks, API-klient | [references/frontend.md](references/frontend.md) |
| FastAPI, Pydantic, SQLAlchemy, Alembic, MySQL | [references/backend.md](references/backend.md) |
| Vitest, pytest, testdatabas, testdata | [references/tester.md](references/tester.md) |
| Färger, layout, tillgänglighet, UI-texter | [references/ui-design.md](references/ui-design.md) |

## Grundregler som gäller överallt

**Språk**
- All kod – variabler, funktioner, typer, filer, tabeller, kolumner, API-fält – på **engelska**.
- All text som användaren ser – etiketter, knappar, felmeddelanden, tomlägen – på **svenska**.
- Kommentarer, commit-meddelanden och PR-texter på **svenska**.
- Använd ordlistan i [references/arkitektur.md](references/arkitektur.md#ordlista). Hitta inte på synonymer (`case`, `issue`, `errand` …) – det heter alltid `ticket`.

**Ett ställe för varje sanning**
- Maskinvärden (kategori, prioritet, status) och längdgränser: backend i `backend/app/schemas.py` och `backend/app/models.py`, frontend i `frontend/src/domain/ticket.ts`. Båda ska stämma med API-kontraktet. Ändras en regel ändras alla tre i samma PR, med tester.
- Svenska visningsnamn och fältspecifika felmeddelanden finns bara i `frontend/src/domain/`.
- Backend är alltid den som avgör (K2: reglerna gäller även om gränssnittet kringgås). Frontendens validering är bara snabb återkoppling.

**Fel får aldrig se ut som framgång (K7)**
- Visa aldrig "Sparat" eller uppdatera listan förrän backend svarat med lyckat resultat. Ingen optimistisk uppdatering.
- Skilj på *säkert misslyckat* (`storage_unavailable`) och *okänt utfall* (`save_outcome_unknown`). Vid okänt utfall: behåll inmatningen, säg att sparandet inte kunde bekräftas och skicka **inte** samma skrivning igen automatiskt.
- Fånga aldrig ett fel och låt det försvinna. Antingen hanteras det och visas för användaren, eller så skickas det vidare.

**Håll det litet**
- En funktion gör en sak. En komponent eller modul som växer över ungefär 200 rader delas upp.
- Lägg inte till bibliotek utan att fråga teamet.
- Bygg inte för framtida funktioner som inte finns i kravspecifikationen (inloggning, roller, radering, redigering av andra fält än status, kundregister, AI-funktioner ingår inte).

**Skriv inte om befintlig text i `.md`-filer**
- Lägg bara till eller ändra det som uppgiften kräver. Omformulera, korta eller "förbättra" aldrig meningar som fortfarande stämmer.
- Måste befintlig text ändras, t.ex. för att den blivit fel: fråga först. Visa nuvarande text, föreslagen text och varför, och vänta på godkännande.
- Exempel: när bara projektstatusen i README behövde uppdateras skrevs även "registrerar, läser och följer kundärenden" om till "ska kunna registrera, läsa och följa kundärenden". Det ska inte göras utan att fråga.

**Bara påhittade uppgifter och inga hemligheter**
- Testdata, seed-data och exempel använder påhittade namn som "Exempelkund" eller "Anna Exempel". Aldrig riktiga personuppgifter.
- `.env` checkas aldrig in – bara `.env.example`. Inga lösenord eller anslutningssträngar i kod.

## Git och PR

- Branch per uppgift: `feature/<kort-namn>`, `fix/<kort-namn>`, `docs/<kort-namn>`, t.ex. `feature/status-filter`.
- Commits enligt Conventional Commits med svensk beskrivning och krav-ID när det finns: `feat: lägg till statusfilter (K8)`.
- En PR gäller ett krav eller en sammanhängande del. Beskrivningen anger krav-ID, berörda tester, hur det verifierats och faktiska testresultat.
- Merge till main först när en annan teammedlem granskat och både backend- och frontendtester är gröna i GitHub Actions (Q6). En funktion är färdig först när den verifierats mot den riktiga motparten – frontend mot riktig backend och tvärtom.

## Innan du säger att du är klar

- [ ] Koden följer befintlig struktur och kommer överens med API-kontraktet.
- [ ] Namn följer ordlistan och namngivningsreglerna.
- [ ] Felvägar är hanterade och ger svenska, begripliga meddelanden – även okänt sparutfall.
- [ ] Tester finns för happy path, error path och gränsfall.
- [ ] Backend: `python -m pytest -q` (med `mysql-test` igång). Frontend: `npm test` och `npm run build`. Utfallet redovisas som det faktiskt blev.
- [ ] Ändrat schema har en Alembic-migration.
- [ ] Inga beslut från tabellen "Öppna beslut" har fattats på egen hand.
- [ ] UI följer färgtokens och tillgänglighetsreglerna.
- [ ] Ingen befintlig text i `.md`-filer har omformulerats utan godkännande.
