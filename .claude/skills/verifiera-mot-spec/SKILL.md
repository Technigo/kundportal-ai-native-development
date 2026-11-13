---
name: verifiera-mot-spec
description: "Kontrollerar att frontendens tester och kod gör det som ett acceptanskriterium kräver (A# i docs/specs/kravspec.md, SF-A# i docs/specs/sok-filter.md), med de sex stegen i docs/verifieringsplan.md. Använd när ett A# eller SF-A# ska verifieras, när ett test saknas, kontrollerar fel sak eller ska döpas om efter sitt id, eller när koden på frontend-v2 gör något annat än specen."
---

# Verifiera mot specen

Frontenden på `frontend-v2` byggdes före specen. Därför arbetar vi baklänges: vi utgår från koden och testerna som finns och kontrollerar dem mot specen, ett acceptanskriterium i taget.

## Gör så här

1. Följ de sex stegen i [docs/verifieringsplan.md, "Kod som byggdes före specen"](../../../docs/verifieringsplan.md#kod-som-byggdes-före-specen-frontend-v2) för varje A# och SF-A#.
2. Läs utgångsläge, handling och förväntat resultat direkt i [kravspec.md](../../../docs/specs/kravspec.md) eller [sok-filter.md](../../../docs/specs/sok-filter.md).
3. Vilket test som hör till vilket id står i kolumnen Test i verifieringsplanens tabell. `–` betyder att testet saknas och ska skrivas.
4. Ta en komponent i taget, så att varje granskning blir liten.
5. Kör `npm run check` i `frontend/` innan du rapporterar. Allt ska gå igenom.

## Regler

1. **Specen gäller, inte koden.** Gör koden något annat än [kravspec.md](../../../docs/specs/kravspec.md) eller [sok-filter.md](../../../docs/specs/sok-filter.md) säger, rättar ni koden. Är specen fel skriver ni en öppen fråga (Q#) i specen och beslutar i teamet. Ändra den inte i smyg. Beslutet står i [beslut.md](../../../docs/beslut.md).
2. **Bara status får ändras på ett ärende.** All redigering ska bort (kravspec.md, "Ingår inte").
3. **Ett test som går igenom räcker inte.** Testet ska kontrollera det som acceptanskriteriet säger, även det som _inte_ ska ändras.
4. **Körresultaten gäller.** Att AI säger att något fungerar räcker inte. Ni kör testerna själva och skriver in resultatet ([ai-arbetssatt.md](../../../docs/ai-arbetssatt.md)).
5. **Testnamn börjar med id:t**, till exempel `A2: …` eller `SF-A1: …`.

För en agent betyder regel 1 och 4: ändra inte specen, utan rapportera avvikelsen så att teamet kan skriva en Q#. Rapportera kommandot du körde och den faktiska utskriften, inte en egen bedömning.

## Checklista för varje test

Gå igenom alla punkter för varje test och svara på var och en med ja, nej eller inte relevant, och radnummer. Hoppa inte över en punkt för att testet ser bra ut.

1. **Görs handlingen i specen?** Testet ska göra det som står under Handling, till exempel skicka en otillåten kategori. Det räcker inte att visa hur gränssnittet reagerar på ett fel som testet själv har hittat på.
2. **Kontrolleras utgångsläget före handlingen?** Om specen säger "två ärenden finns" ska testet kontrollera det innan handlingen, inte bara efteråt.
3. **Kan varje `expect` misslyckas?** Ta en kontroll i taget och fråga: vilket fel i koden skulle göra just den här raden röd? Finns inget sådant fel prövar raden ingenting.
4. **Ersätter en låtsad backend det som ska prövas?** När testet byter ut mocken med `server.use(...)` prövas inte längre mockens egna regler, och data i `db` ändras bara om den nya handlern gör det. En kontroll av `db` efter en sådan handler kan därför bli tom.
5. **Prövar testet det som inte ska ändras?** Till exempel att inget nytt ärende sparas, eller att övriga fält är oförändrade.
6. **Är beskedet begripligt enligt R12?** Kontrollera att testet visar beskedet på svenska och utan teknisk text, eller ange var det prövas i stället.
7. **Är texter kopierade?** Om en felrubrik eller ett meddelande står både i testet och i koden eller mocken kan de börja skilja sig åt. Ange var.

## Vad testet ska visa

Sammanfattning av kravspec.md. Vid skillnad gäller kravspec.md. A5 och A11 prövas bara i backend.

| A#  | Del                                                 | Testet ska visa                                                                                       |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A1  | Formuläret (`ArendeForm.test.tsx`)                  | Ett giltigt ärende sparas med status _Nytt_ och en skapad-tid, och det syns i listan                  |
| A2  | Formuläret                                          | Ärendet avvisas om rubriken saknas och ett begripligt besked visas. Det finns fortfarande två ärenden |
| A3  | Formuläret                                          | Samma som A2, men rubriken består bara av mellanslag                                                  |
| A4  | Formuläret                                          | En otillåten kategori avvisas med ett begripligt besked, och inget ärende sparas                      |
| A6  | Listan (`App.test.tsx`, `filterArenden.test.ts`)    | Tre ärenden visas med rubrik, status, prioritet och skapad-tid                                        |
| A12 | Listan                                              | Det nyaste ärendet visas först och det äldsta sist                                                    |
| A7  | Detaljvyn (`ArendeDetail.test.tsx`)                 | Alla fält visas för det valda ärendet                                                                 |
| A8  | Detaljvyn                                           | Status ändras till _Pågående_ och övriga fält är oförändrade                                          |
| A9  | Detaljvyn                                           | En ogiltig status avvisas med ett begripligt besked, och status är fortfarande _Nytt_                 |
| A10 | Detaljvyn                                           | Ett ärende som inte finns ger ett begripligt besked                                                   |

Tänk på detta:

- A2, A3 och A4 börjar med två ärenden. Testet ska börja med två och kontrollera att det fortfarande är två efteråt.
- Ett begripligt besked är på svenska och innehåller inget tekniskt felmeddelande (R12).
- Mocken för A8 och A9 ska svara enligt kontraktet för statusändringen under "Plan och vårt beslut" i [backenduppdraget](../../../docs/agentuppdrag/2026-11-02-backend-status-och-varden.md). Står svaret inte där: rapportera det i stället för att gissa.
- A8 kräver också att statusen finns kvar efter omstart. Det kan frontendtestet inte visa. Den delen prövas i backend.

### Sökning och filtrering (SF-A1–SF-A14)

- Samma sex steg för varje SF-A# i [sok-filter.md](../../../docs/specs/sok-filter.md).
- Sökningens gamla testnamn `A11`–`A16` krockar med kärnspecens A11 och A12. Byt till `SF-A#`. Kolumnen Test i verifieringsplanen visar vilket test som hör till vilket id. `A11` och `A12` används bara för kärnspecens kriterier.

## Bra att veta i koden

- **Testerna går mot mockar** (`src/mocks/handlers.ts`). De visar inte att frontend och backend fungerar ihop.
- **Sätt utgångsläget med `db.reset([...])`**, till exempel två ärenden för A2. `src/test/setup.ts` återställer mocken efter varje test. Lägger du till ny mockdata måste den återställas där också.
- **MSW kör med `onUnhandledRequest: "error"`.** Ett test som anropar en endpoint utan handler misslyckas. Lägg till handlern, lätta inte på inställningen.
- **Felbesked går via `ApiError`.** Mocken svarar med backendens beslutade texter, utan prefixet `Value error, `. `toApiError` i `src/api/apiError.ts` tar ändå bort prefixet, eftersom dagens backend skickar det. Ett test för R12 kan låta mocken skicka prefixet med `server.use(...)` och kontrollera att `Value error` inte syns.
- **Sök element på roll och etikett, inte på CSS-klass.** Etiketterna måste vara unika: filterraden heter "Filtrera kategori" för att inte krocka med formulärets "Kategori".
