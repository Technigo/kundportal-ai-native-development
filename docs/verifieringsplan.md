# Verifieringsplan

Planen visar vilka tester som finns, varför vi valt dem och vad körningarna visade. Den kopplar acceptanskriterier (A#) och kvalitetskrav (K#) i [specs/](specs/) till tester.

## Så väljer vi tester

- Varje A# och K# får minst en rad i spårbarhetstabellen, även om kontrollen bara är planerad eller manuell. Då syns luckorna.
- Vi tar med happy paths, error paths (felaktig indata och misslyckade operationer) och gränsfall utifrån reglerna, till exempel text med bara mellanslag eller inmatning vid och över en längdgräns.
- När ett fel hittas beskriver vi förväntat och faktiskt resultat, rättar och lägger till ett regressionstest som fångar felet om det återkommer.

## Kod som byggdes före specen (`frontend-v2`)

Frontenden på `frontend-v2` byggdes innan specen var klar, och den har redan egna tester. Där arbetar vi därför baklänges: vi börjar med koden och testerna som finns och kontrollerar dem mot specen. Vanligtvis går det tvärtom, från spec till test till kod. Beslutet står i [beslut.md](beslut.md).

**Specen gäller, inte koden.** Att ett test går igenom visar bara att koden gör det testet kontrollerar. Det visar inte att koden gör det specen kräver.

För varje A# som berör frontenden gör vi så här innan koden läggs in i `main`:

1. **Hitta testet.** Vilket befintligt test hör till kriteriet? Finns inget skriver vi ett nytt.
2. **Jämför med specen.** Kontrollerar testet samma utgångsläge, handling och förväntade resultat som kriteriet, även det som _inte_ ska ändras? Om inte rättar vi testet, inte specen.
3. **Rätta koden** om den gör något annat än specen säger.
4. **Pröva att testet kan misslyckas.** Ett test som skrivs efter koden kan råka alltid gå igenom. Vi ändrar koden tillfälligt så att den gör fel och kontrollerar att testet då misslyckas.
5. **Byt namn** så att testet börjar med id:t, till exempel `A2: …` eller `SF-A1: …`.
6. **Kör testet**, skriv in resultatet under [Resultat](#resultat) och ändra status till Genomförd.

Testerna på `frontend-v2` går mot mockar, alltså låtsasdata i stället för det riktiga API:t. De visar därför inte att frontend och backend fungerar ihop. Kriterier som handlar om lagring kontrolleras också med API-tester mot backend.

Om specen visar sig vara fel eller ofullständig ändrar vi inte specen i smyg för att den ska passa koden. Vi skriver en öppen fråga i specen och beslutar i teamet.

## Hur testerna körs

- **Backend:** `python -m pytest` från `backend/`. Testerna finns i [backend/tests/](../backend/tests/).
- **Frontend:** `npm run check` från `frontend/`. Kommandot kontrollerar format, lint och typer, kör testerna och bygger appen. Bara testerna körs med `npm run test:run`. CI kör `npm run check` på varje PR som ändrar `frontend/`. Testerna finns i [App.test.tsx](../frontend/src/App.test.tsx), [ArendeForm.test.tsx](../frontend/src/components/ArendeForm.test.tsx), [ArendeDetail.test.tsx](../frontend/src/components/ArendeDetail.test.tsx), [StatusOverview.test.tsx](../frontend/src/components/StatusOverview.test.tsx), [filterArenden.test.ts](../frontend/src/utils/filterArenden.test.ts), [countByStatus.test.ts](../frontend/src/utils/countByStatus.test.ts) och [arendenApi.test.ts](../frontend/src/api/arendenApi.test.ts).
- **Manuellt:** stegen står under [Manuella kontroller](#manuella-kontroller).

## Spårbarhet

Testnamn börjar med id:t, till exempel `test_a2_saknad_rubrik_avvisas` (pytest) eller `it("A2: avvisar ärende utan rubrik")` (Vitest). Specen säger vilket R ett A kontrollerar; den här tabellen säger vilket test som kontrollerar ett A.

Testerna vars namn börjar med `test_` är API-tester i `backend/tests/`. Övriga är frontendtester i `frontend/src/` som går mot mockar. Sökningens id har prefixet `SF-` och statusöversiktens `SO-`. `–` i kolumnen Test betyder att inget test finns än, och `–` i kolumnen A#/K# att specen saknar ett acceptanskriterium för testet. `?` betyder att teamet inte har bestämt ännu.

| A#/K#  | R#           | Typ        | Nivå           | Test                                                                                                              | Status    | Senaste resultat     | Ansvarig |
| ------ | ------------ | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------- | --------- | -------------------- | -------- |
| A1     | R1           | Happy path | API, komponent | `test_a1_nytt_arende_far_status_nytt_och_syns_i_listan`, `A1: a valid case is saved with status Nytt and a created time, and shows in the list` | Genomförd | API: passerade 2026-11-02, komponent: passerade 2026-11-03 | Ruben |
| A2     | R2, R3, R12  | Error path | API, komponent | `test_a2_saknad_eller_tom_rubrik_avvisas_och_inget_sparas`, `A2: a case without a title is rejected with a clear message; still two cases` | Genomförd | API: passerade 2026-11-05, komponent: passerade 2026-11-09 | Sravani (komponent), Otto (API) |
| A3     | R2, R3, R12  | Gränsfall  | API, komponent | `test_a3_rubrik_med_bara_mellanslag_avvisas_och_inget_sparas`, `A3: a title with only spaces counts as empty; still two cases` | Genomförd | API: passerade 2026-11-05, komponent: passerade 2026-11-09 | Sravani (komponent), Otto (API) |
| A4     | R3, R4, R12  | Error path | API, komponent | `test_a4_otillaten_kategori_avvisas_och_inget_sparas`, `A4: the backend's rejection of a category is shown clearly and nothing is passed on` | Genomförd | API: passerade 2026-11-05, komponent: passerade 2026-11-10. Komponenttestet visar bara att backendens besked visas, se Q8 i [kravspec.md](specs/kravspec.md) | Sravani (komponent), Otto (API) |
| A5     | R5           | Happy path | API            | `test_a5_arende_finns_kvar_efter_omstart`                                                                         | Genomförd | API: passerade 2026-11-02 | Nathalie |
| A6     | R6           | Happy path | Komponent      | `A6: all three cases show with title, status, priority and created time` | Genomförd | Komponent: passerade 2026-11-03 | Ruben |
| A7     | R7           | Happy path | Komponent      | `A7: all fields of the chosen case are shown` | Genomförd | Komponent: passerade 2026-11-03 | Ruben |
| A8     | R5, R8       | Happy path | Enhet, API, komponent | `test_a8_statusandring_sparas_efter_omstart_och_andra_falt_oforandrade`, `test_a8_statussvar_paverkas_inte_av_senare_andring`, `test_a8_minneslagring_andrar_bara_status_och_okant_id_ger_none`, `A8: the status changes to Pågående and the other fields are unchanged` | Genomförd | Enhet och API: passerade 2026-11-09, komponent: passerade 2026-11-04 | Nathalie (komponent), Otto (API) |
| A9     | R9, R12      | Error path | API, komponent | `test_a9_ogiltig_status_avvisas_och_gamla_statusen_ligger_kvar`, `A9: an invalid status is rejected with a clear message and the status is still Nytt` | Genomförd | API: passerade 2026-11-05, komponent: passerade 2026-11-04 | Nathalie (komponent), Otto (API) |
| A10    | R10, R12     | Error path | API, komponent | `test_a10_okant_arende_ger_svenskt_besked`, `test_a10_statusandring_for_okant_arende_ger_svenskt_besked`, `test_a10_stora_id_ger_404_for_hamtning_och_statusandring`, `A10: shows a clear message when the case does not exist` | Genomförd | API: passerade 2026-11-06, komponent: passerade 2026-11-03 | Ruben |
| A11    | R3, R4, R12  | Error path | API            | `test_a11_otillaten_prioritet_avvisas_och_inget_sparas`                                                           | Genomförd | API: passerade 2026-11-05 | Otto     |
| A12    | R6           | Happy path | Enhet          | `A12: the most recently created case comes first and the oldest last` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| –      | R12          | Error path | API            | `test_r12_http_fel_for_metod_och_sokvag_ar_pa_svenska` | Genomförd | API: passerade 2026-11-09 | Otto |
| –      | R12          | Gränsfall  | API            | `test_r12_text_med_ensam_unicode_surrogat_avvisas_pa_svenska` | Genomförd | API: passerade 2026-11-09 | Otto |
| –      | –            | Gränsfall  | Enhet          | `test_legacy_varden_returneras_oforandrade` | Genomförd | Enhet: passerade 2026-11-09. Följer beslutet i [backenduppdraget](agentuppdrag/2026-11-02-backend-status-och-varden.md#plan-och-vårt-beslut): ingen CHECK för kategori och prioritet, så värdena kontrolleras när de sparas, inte när de läses | Otto |
| K1     | –            | –          | Manuell        | [K1 – bara tangentbord](#k1--bara-tangentbord) | Genomförd | Manuell: godkänd 2026-11-06 | Nathalie och Ruben |
| SF-A1  | SF-R1, SF-R7 | Happy path | Enhet          | `SF-A1: 'faktura' finds C3 and C1, with C3 first` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A2  | SF-R1        | Happy path | Enhet          | `SF-A2: 'FAKTURA' gives the same result as 'faktura'` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A3  | SF-R1        | Gränsfall  | Enhet          | `SF-A3: 'FÖR' finds only C1` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A4  | SF-R1        | Happy path | Enhet          | `SF-A4: 'inloggningen', only in the description, finds only C2` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A5  | SF-R1        | Happy path | Enhet          | `SF-A5: part of a word, 'faktur', finds C3 and C1` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A6  | SF-R2        | Happy path | Enhet          | `SF-A6: status Nytt shows only C1, and Alla shows all three again` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A7  | SF-R2        | Happy path | Enhet          | `SF-A7: kategori Teknik shows only C2` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A8  | SF-R2        | Happy path | Enhet          | `SF-A8: prioritet Låg shows only C3` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A9  | SF-R3        | Happy path | Enhet          | `SF-A9: 'faktura' and status Nytt together show only C1` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A10 | SF-R4, SF-R8 | Gränsfall  | Komponent      | `SF-A10: 'xyz' gives 'Inga ärenden matchar'; clearing and searching again shows all three unchanged` | Genomförd | Komponent: passerade 2026-11-03 | Ruben |
| SF-A11 | SF-R5        | Gränsfall  | Enhet          | `SF-A11: only spaces shows all three, and '  faktura  ' is the same as 'faktura'` | Genomförd | Enhet: passerade 2026-11-03 | Ruben |
| SF-A12 | SF-R6        | Gränsfall  | Komponent      | `SF-A12: '<script>' is plain text: 'Inga ärenden matchar', and the app keeps working` | Genomförd | Komponent: passerade 2026-11-03 | Ruben |
| SF-A13 | SF-R9        | Happy path | Komponent      | `SF-A13: the list is unchanged while typing and is searched when Enter is pressed` | Genomförd | Komponent: passerade 2026-11-03 | Ruben |
| SF-A14 | SF-R10       | Gränsfall  | Komponent      | `SF-A14: the search field holds at most 100 characters` | Genomförd | Komponent: passerade 2026-11-03 | Ruben |
| SO-A1  | SO-R1, SO-R4 | Happy path | Enhet, komponent | `SO-A1: S1–S4 give Nytt 2, Pågående 1, Väntar på kund 0, Avslutat 1, in that order`, `SO-A1: shows the four statuses in order, with no buttons or links`, `SO-A1: opening the list shows Nytt 2, Pågående 1, Väntar på kund 0, Avslutat 1 and all four cases` | Genomförd | Enhet och komponent: passerade 2026-11-06 | Nathalie |
| SO-A2  | SO-R1        | Gränsfall  | Enhet, komponent | `SO-A2: no cases give 0 for all four statuses`, `SO-A2: with no cases all four statuses show 0`, `SO-A2: with no cases the overview shows 0 for all four and the list 'Inga ärenden ännu'` | Genomförd | Enhet och komponent: passerade 2026-11-06 | Nathalie |
| SO-A3  | SO-R3        | Happy path | Komponent      | `SO-A3: changing S1 from Nytt to Pågående updates the overview, the other counts are unchanged` | Genomförd | Komponent: passerade 2026-11-06 | Nathalie |
| SO-A4  | SO-R3        | Happy path | Komponent      | `SO-A4: creating a valid case updates the overview to Nytt 3, the other counts are unchanged` | Genomförd | Komponent: passerade 2026-11-06 | Nathalie |
| SO-A5  | SO-R2, SO-R4 | Gränsfall  | Komponent      | `SO-A5: searching 'xyz' and filtering Avslutat gives 'Inga ärenden matchar', the overview is unchanged` | Genomförd | Komponent: passerade 2026-11-06 | Nathalie |
| SO-A6  | SO-R5        | Error path | Komponent      | `SO-A6: when the list cannot be fetched an error is shown and no overview` | Genomförd | Komponent: passerade 2026-11-06 | Nathalie |
| SO-A7  | SO-R5        | Gränsfall  | Komponent      | `SO-A7: while the list is loading 'Laddar ärenden…' is shown and no overview` | Genomförd | Komponent: passerade 2026-11-06 | Nathalie |
| SO-A8  | SO-R1        | Gränsfall  | Enhet, komponent | `SO-A8: three cases, all Avslutat, give Nytt 0, Pågående 0, Väntar på kund 0, Avslutat 3, in that order`, `SO-A8: opening the list with three Avslutat cases shows Nytt 0, Pågående 0, Väntar på kund 0, Avslutat 3` | Genomförd | Enhet och komponent: passerade 2026-11-06 | Nathalie |
| SO-K1  | –            | –          | Komponent      | `SO-K1: the overview is named 'Antal ärenden per status' and each status reads together with its number`. App-testerna hittar också översikten på namnet | Genomförd | Komponent: passerade 2026-11-06 | Nathalie |

- **Typ:** happy path, error path eller gränsfall.
- **Nivå:** enhet, API, komponent eller manuell.
- **Status:** planerad eller genomförd.

## Testnivå och motivering

Nivån för varje kriterium står i kolumnen Nivå i tabellen ovan.

- **API (pytest):** regler och lagring kontrolleras i backend, där de finns. Testet visar att rätt ärende sparas och att inget sparas vid fel.
- **Komponent (Vitest):** det handläggaren ser, till exempel felmeddelanden och listans kolumner.
- **Enhet (Vitest):** sökning, filter och sortering. Snabba tester, så vi kan pröva många fall.
- **Manuell:** det som är svårt att automatisera, till exempel att allt går att göra med tangentbord (K1).

Vi testar inte genom hela gränssnittet. Kursen kräver det inte och det tar lång tid att bygga.

## Manuella kontroller

De manuella kontrollerna prövar det som de automatiska testerna inte visar: att frontend och backend fungerar ihop, att beskeden är begripliga för handläggaren (R12) och att allt går att göra med tangentbord (K1). Använd bara påhittade uppgifter. Skriv in varje genomgång i kontrollens tabell, även när något avviker, och gör en ny rad om kontrollen görs om.

### Hela kedjan mot riktig backend

Kan göras när statusändringen finns i backend (steg 4 i [backenduppdraget](agentuppdrag/2026-11-02-backend-status-och-varden.md)). Starta backend och frontend enligt [README](../README.md), med `npm run dev` och inte mot mockar.

| Steg | Handling | Förväntat | Kontrollerar |
| ---- | -------- | --------- | ------------ |
| 1 | Skapa ett ärende med giltiga uppgifter | Ärendet visas först i listan med status Nytt och en skapad-tid | R1, R6 |
| 2 | Försök skapa ett ärende utan rubrik, och sedan ett med bara mellanslag i rubriken | Ärendet avvisas med ett besked på svenska utan teknisk text. Inget nytt ärende i listan | R2, R3, R12 |
| 3 | Öppna ärendet från steg 1 | Alla fält visas | R7 |
| 4 | Ändra status till Pågående | Status är Pågående i detaljvyn och i listan. Övriga fält är oförändrade | R8 |
| 5 | Stoppa backend med Ctrl+C och ladda om sidan | Ett besked på svenska om att servern inte går att nå, och knappen Försök igen | R12 |
| 6 | Starta backend igen och klicka på Försök igen | Ärendet finns kvar med status Pågående | R5 |
| 7 | Sök på en del av rubriken, filtrera på status Pågående och sök sedan på en text som inte finns | Ärendet visas, och sedan "Inga ärenden matchar" | SF-R1, SF-R2, SF-R4 |

| Datum | Vem | Commit | Utfall |
| ----- | --- | ------ | ------ |
| 2026-11-10 | Hela teamet | Appkoden som på `main` `a84f564` | Alla sju steg som förväntat. Backend och frontend kördes lokalt, inte mot mockar |
| 2026-11-12 | Ruben på sin dator, med hela teamet, på redovisningen | `main` på `4b9fdc5` (samma appkod som `a84f564`) | Hela flödet visades mot riktig backend och fungerade som förväntat med alla krav |

### K1 – bara tangentbord

Kan göras redan nu, mot mockarna med `npm run dev:mock`, eftersom K1 gäller gränssnittet. Använd bara tangentbordet.

| Steg | Handling | Förväntat |
| ---- | -------- | --------- |
| 1 | Gå till Nytt ärende, fyll i alla fält och skapa ärendet | Varje fält och knapp går att nå och använda |
| 2 | Gå till ett ärende i listan och öppna det | Detaljerna öppnas |
| 3 | Välj en ny status i Ändra status | Statusen ändras |
| 4 | Stäng panelen | Panelen stängs |
| 5 | Skriv en söktext och tryck Enter, och välj sedan ett värde i ett filter | Listan visar träffarna |

| Datum | Vem | Commit | Utfall |
| ----- | --- | ------ | ------ |
| 2026-11-06 | Ruben (vid tangentbordet), Nathalie (observerade och antecknade) | `main` på `70a31e2` | Godkänd. Alla fem steg gick med bara tangentbord, och fokus syntes hela tiden. Esc stänger också panelen. Förbättringsförslag: när Nytt ärende öppnas stannar fokus på knappen, så man måste tabba genom sökfältet, filtren och listan innan man kommer till Rubrik. Teamet beslutade 2026-11-12 att inte ändra det. Det står som möjlig förbättring i [begransningar.md](begransningar.md#förslag-på-fortsatt-utveckling) |

### Statusöversikten i appen

Mot mockarna med `npm run dev:mock`. Prövar det som komponenttesterna inte visar: placeringen och att siffrorna ändras utan att sidan laddas om (SO-R3).

| Steg | Handling | Förväntat | Kontrollerar |
| ---- | -------- | --------- | ------------ |
| 1 | Öppna sidan | Översikten står direkt under "Alla ärenden" och stämmer med listan: Nytt 1, Pågående 1, Väntar på kund 0, Avslutat 1 | SO-R1 |
| 2 | Ändra status på "Faktura saknas" från Nytt till Pågående | Siffrorna ändras direkt, utan omladdning | SO-R3 |
| 3 | Skapa ett nytt ärende | Nytt ökar med 1 | SO-R3 |
| 4 | Sök på en text som inte finns | "Inga ärenden matchar", och siffrorna är oförändrade | SO-R2 |

| Datum | Vem | Commit | Utfall |
| ----- | --- | ------ | ------ |
| 2026-11-06 | Nathalie | `8d9e688`, branch `statusoversikt` | Alla steg som förväntat. Märkena i översikten liknar knappar men går inte att klicka på (SO-R4). Att filtrera genom att klicka står under "Ingår inte" i specen |

## Resultat

| Datum      | Commit                       | Kommando                           | Utfall   |
| ---------- | ---------------------------- | ---------------------------------- | -------- |
| 2026-10-30 | Ej committad, branch `specs` | `python -m pytest` från `backend/` | 1 passed |
| 2026-11-02 | `b5260e5`, branch `backend-steg-1` | `python -m pytest` från `backend/` | 3 passed |
| 2026-11-03 | `60843cc`, branch `front-end-rebuild` (bygger på `frontend-v2`) | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 54 passed |
| 2026-11-03 | `60843cc`, branch `front-end-rebuild` (bygger på `frontend-v2`) | `python -m pytest` från `backend/` | 3 passed |
| 2026-11-03 | `71c237b`, branch `front-end-rebuild`, granskning (Nathalie) | `npm run check` från `frontend/` och `python -m pytest` från `backend/` | Lint, typer, 54 passed och bygget gick igenom. format:check gick bara igenom med `--end-of-line auto` (CRLF i Windows). 3 passed |
| 2026-11-04 | `b2e6fca`, branch `a9-test` ([agentuppdraget](agentuppdrag/2026-11-04-a9-test.md)) | `npm run check` från `frontend/` | 54 passed och bygget lyckades. Varje kontroll i A8 och A9 har setts misslyckas med ett tillfälligt fel |
| 2026-11-06 | `8d9e688`, branch `statusoversikt` ([agentuppdraget](agentuppdrag/2026-11-05-statusoversikt.md)) | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 68 passed (54 tidigare och 14 nya för statusöversikten). Varje kontroll i SO-testerna har setts misslyckas med ett tillfälligt fel |
| 2026-11-09 | Ej committad, branch `backend-agentuppdrag-and-put-method` efter merge av `main`, granskning (Ruben) | `python -m pytest` från `backend/` | 16 passed |
| 2026-11-09 | Ej committad, branch `qa-frontend-testing` (bygger på `9ea263b`) ([agentuppdraget](agentuppdrag/2026-11-09-a2-a4-form-tests.md)) | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 54 passed. Varje kontroll i A2 och A3 har setts misslyckas med ett tillfälligt fel. A4 väntar på teamets beslut |
| 2026-11-09 | Ej committad, merge av `main` (`c8077a4`) i `qa-frontend-testing` | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 68 passed (54 tidigare och 14 för statusöversikten), A2 och A3 ingår - se [logg](testing/evidence/2026-11-09-baseline-after-merge-npm-run-check.txt) |
| 2026-11-10 | Ej committad, branch `qa-frontend-testing` på `bf49dac` ([agentuppdraget](agentuppdrag/2026-11-09-a2-a4-form-tests.md)) | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 68 passed. Varje kontroll i A4 har setts misslyckas med ett tillfälligt fel - se [logg](testing/evidence/2026-11-10-A4-can-fail.txt) |
| 2026-11-10 | Ej committad, branch `qa-frontend-testing` på `bf49dac`, efter kodgranskningen av A2–A4. Samma kod committades sedan som `13a9137` ([agentuppdraget](agentuppdrag/2026-11-09-a2-a4-form-tests.md)) | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 68 passed. A4 kontrollerar nu att formuläret skickade den valda kategorin, och varje kontroll i A4 har setts misslyckas på nytt - se [logg](testing/evidence/2026-11-10-baseline-after-review-npm-run-check.txt) och [A4-bevis](testing/evidence/2026-11-10-A4-can-fail.txt) |
| 2026-11-12 | Slutkörning: appkoden som på `main` `4b9fdc5`, med dokumentändringar ovanpå som inte är committade | `python -m pytest` från `backend/` | 16 passed |
| 2026-11-12 | Slutkörning: appkoden som på `main` `4b9fdc5`, med dokumentändringar ovanpå som inte är committade | `npm run check` från `frontend/` | Format, lint, typer och bygge gick igenom. 68 passed |

## Begränsningar

- Frontendtesterna går mot mockar. Inget automatiskt test visar att frontend och backend fungerar ihop. Det kontrolleras manuellt, se [Hela kedjan mot riktig backend](#hela-kedjan-mot-riktig-backend).
- Mockarna och den riktiga backend följer samma beslut i [backenduppdraget](agentuppdrag/2026-11-02-backend-status-och-varden.md): statusändringen, kontrollen av kategori och prioritet och de svenska felmeddelandena. API-testerna visar att backend följer besluten, men inte att den svarar exakt som mockarna.
- Statusöversiktens tester skrevs efter specen och före koden, och varje kontroll har setts misslyckas med ett tillfälligt fel, se [statusöversiktens agentuppdrag](agentuppdrag/2026-11-05-statusoversikt.md). De visar inte hur en riktig skärmläsare läser översikten (SO-K1), och inte heller att sidan inte laddas om (SO-R3). Det senare kontrolleras manuellt i [Statusöversikten i appen](#statusöversikten-i-appen).
- Frontendens tester skrevs efter koden. Varje test i tabellen har jämförts med specen och setts misslyckas med en tillfällig felaktig ändring, se [frontenduppdraget](agentuppdrag/2026-11-03-frontend-mot-spec.md).
- K1 är kontrollerad mot mockarna, inte mot riktig backend. Kontrollen gäller gränssnittet, så resultatet bör vara detsamma, men det är inte prövat.
