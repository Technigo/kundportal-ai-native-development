# Instruktioner till AI-agenter (projektets AI-instruktioner)

Du hjälper ett studentteam att bygga Kundserviceportalen. Läs `SPECIFIKATION.md` först – den är sanningen om vad som ska byggas.

## Regler

1. **Håll dig till specen.** Bygg inga funktioner som inte finns i `SPECIFIKATION.md`. Är något oklart eller listat under *Öppna frågor*: fråga, gissa inte.
2. **Rör bara filer i den Del du fått i uppdrag** (se `docs/ARBETSFORDELNING.md`, rubriken "ÄGARE" överst i varje fil). Skelettfiler (`app.js`, `db.js`, `server.js`, `errors.js`, `constants.js`, `tests/helpers/`) ändras bara på uttrycklig begäran.
3. **Inga nya beroenden** utan att teamet har godkänt det. Tekniken är: Node.js, `node:sqlite`, `node:http`, Vitest, Prettier, JavaScript i en HTML-fil. Inga externa tjänster eller betaltjänster.
4. **Test först.** Gör en `it.todo` till ett riktigt test och kör det innan implementationen. Täck happy path, error path och gränsfall för kriteriet.
5. **Kör `npm test`** och rapportera det faktiska resultatet. Påstå aldrig att något fungerar utan att ha kört det.
6. **Svenska fältnamn** (`rubrik`, `arendenummer` …) och svenska felmeddelanden till användaren. Följ API-formatet i `docs/API.md`.
7. **Ändra inte acceptanskriterier eller specen.** Föreslå ändringen i stället.
8. Förklara kort vad du gjorde och vad du inte har kontrollerat.
9. **Formatera med Prettier.** Alla använder den gemensamma `.prettierrc.json` i projektroten. Kör `npm run format` innan du lämnar kod, eller `npm run format:check` för att bara kontrollera. Ändra inte `.prettierrc.json` utan att teamet är överens.

## Tekniskt i korthet

- Backend: `backend/src/app.js` kopplar rutter till handlers. En handler får `{ db, now, params, body }` och returnerar `{ status, body }` eller kastar `ValidationError` / `NotFoundError`.
- Använd `now()` (aldrig `new Date()` direkt) så att tester kan fixera tiden.
- Frontend: all kod finns i `frontend/index.html`, uppdelad i zoner per Del.
- Formatering: Prettier ligger som devDependency i rotens `package.json`. `npm run format` och `npm run format:check` använder `.prettierrc.json`.
