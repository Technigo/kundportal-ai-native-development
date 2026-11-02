# Beslutslogg

Beslut och förtydliganden som användaren lämnade i projektsessionerna 2026-11-01 och 2026-11-02. Loggen visar inte i sig att båda teammedlemmarna har godkänt besluten eller uppfyller individuella betygskriterier. När användaren valde ett rekommenderat alternativ markeras det som sådant; bakomliggande motiv anges bara när de uttrycktes.

## Beslut 2026-11-01

| # | Beslut | Typ | Följd/evidens |
|---|---|---|---|
| 1 | Använd TypeScript med React/Vite, Express och SQLite. | Val av rekommenderat alternativ | Lokal fullstackstruktur i `packages/`. |
| 2 | MVP:n ska köras lokalt; hosting krävs inte. | Uttrycklig avgränsning | Planens scope och README. |
| 3 | Bygg basen tillsammans och håll två ännu ej valda individuella tillägg utbyggbara och oberoende. | Uttryckligt mål | Featurebaserad plan och separerade lager. |
| 4 | Börja med ett körbart projektskelett och README som kort beskriver projektet och lokal start. | Uttrycklig ordningsföljd | Commit `e7012eb6`; README. |
| 5 | Dela MVP-arbetet i små vertikala, feature-drivna tickets; varje kravspec ska ange leverans, acceptanskriterier och när ticketen är färdig. | Uttrycklig arbetsform | [Featuretickets](../features/README.md), commit `25805521`. |
| 6 | Arbeta stegvis: verifiera och granska varje steg, invänta bekräftelse före nästa och committa godkända steg. | Uttrycklig processregel | [MVP-plan](../../plan.md); commits `e7012eb6`, `55d597fa`, `25805521`, `e0ec5616`, `fecff9ee`. |
| 7 | Skriv så kortfattat som möjligt och använd punktlistor där det passar. | Uttrycklig kommunikationspreferens | Tillämpas i dokumentationen och arbetsflödet. |
| 8 | Använd separata kravspecar per feature med stabila ID:n som återkommer i tester. | Val av rekommenderat alternativ | [Kravindex](../features/README.md). |
| 9 | Varje krav-ID ska ha minst ett automatiserat test; ett test får täcka flera krav och en feature får ha flera tester. | Uttryckligt förtydligande av tidigare tolkning | [TDD-skill](../../.github/skills/requirement-driven-tdd/SKILL.md) och test-ID:n i specifikationerna. |
| 10 | Kompletterande MVP-feature är interna anteckningar. De är frivilliga vid skapande och kan läggas till eller redigeras senare. Att spara tom eller blank text raderar anteckningen. | Uttryckligt val och korrigering | [CASE-NOTE](../features/case-note.md). Ingen författare eller ändringshistorik; ingen inloggning i MVP:n. |
| 11 | Tillåt statusarna Nytt, Pågående, Väntar på kund och Avslutat; tillåt alla övergångar mellan giltiga statusar. | Val av rekommenderat alternativ | [CASE-STATUS](../features/case-status.md). |
| 12 | Kategorierna är Konto, Fakturering, Tekniskt och Övrigt; prioriteterna Låg, Normal och Hög. Kategori och prioritet väljs i rullistor. | Val av rekommenderat alternativ, senare förtydligat | [CASE-CREATE](../features/case-create.md). |
| 13 | Rubrik krävs, max 120 tecken; beskrivning krävs, max 2 000; anteckning är inte obligatorisk och max 2 000 tecken. Obligatorisk text trimmas. | Rekommenderade val godkändes med korrigering att beskrivning krävs men anteckning inte gör det | [CASE-CREATE](../features/case-create.md), [CASE-NOTE](../features/case-note.md). |
| 14 | Om anteckning bara innehåller blanksteg behandlas den som tom och raderas vid sparning. | Val av rekommenderat alternativ | [CASE-NOTE](../features/case-note.md). |
| 15 | Sortera ärendelistan med nyaste ärendet först. | Val av rekommenderat alternativ | [CASE-LIST](../features/case-list.md); commit `fecff9ee`. |
| 16 | Använd Color Hunt-paletten som bas, men justera kontrast vid behov. | Val av rekommenderat alternativ | [UI-CONSISTENCY](../features/ui-consistency.md) och [UI-skill](../../.github/skills/ui-consistency/SKILL.md). |
| 17 | Lägg delade instruktioner och skills i projektets `.github/`. | Val av rekommenderat alternativ | Copilot-instruktioner och skills i `.github/`; commit `55d597fa`. |
| 18 | Teststrategin ska omfatta Vitest, Supertest, React Testing Library och Playwright E2E. | Val av rekommenderat alternativ | [MVP-plan](../../plan.md). E2E-tester återstår; valet är inte evidens på att de körts. |
| 19 | Vid osäkerhet ska agenten fråga i stället för att själv bestämma; frågor får gärna innehålla tre alternativ och en rekommendation. | Uttrycklig samarbetsregel | Förtydliganden om anteckningar, indata, testbarhet och sortering hämtades in innan de skrevs in som krav. |
| 20 | Skapa dokumentation som hjälper teamet följa G/VG-kriterier och ställer reflektionsfrågor där individuell evidens saknas. | Uttryckligt mål | [Examinationsunderlag](./README.md), [kriteriematris](./criteria-matrix.md) och evidens-skillen. |
| 21 | Bevara relevanta beslut från sessionen för framtida redovisning och committera dokumentationen. | Uttrycklig begäran | [AI-arbetsflöde och sessionspår](./ai-workflow.md); commit `b58878ee`. |
| 22 | Efter dokumentationssteget: committa och pausa; fortsätt MVP-arbetet en annan dag. | Uttrycklig instruktion | Vid pausen var nästa oavslutade feature CASE-DETAIL. Arbetet återupptogs 2026-11-02; se besluten nedan och [MVP-planen](../../plan.md). |

## Beslut 2026-11-02

Underlaget är användarens uttryckliga instruktioner och svar i sessionschatten. Commitreferenserna visar genomförda ändringar, inte vem som skrivit varje kodrad eller vilka manuella kontroller användaren själv utfört.

| # | Beslut | Typ | Följd/evidens |
|---|---|---|---|
| 23 | Skriv tester som testar en sak i taget. Dela först upp det utpekade testet och gå sedan igenom hela formulärets testfil enligt samma princip. | Uttrycklig korrigering av AI-förslag: ”Kom ihåg att i framtiden skriv tester som testar en sak per test.” | [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx) delades upp i mer fokuserade tester och [testmappningen](../features/case-create.md) uppdaterades; commit `d2f7dd1`. Principen kompletterar beslut 9: flera krav-ID:n får bara samlas när testet fortfarande har ett sammanhängande fokus. |
| 24 | Testprincipen om ett beteende per test ska gälla detta repository. | Uttryckligt val av omfattning i följdfråga | Sparades som repositorypreferens efter användarens svar ”repository”. Ingen motsvarande preferens för alla användarens repositoryn beslutades. |
| 25 | Ta bort testet som kontrollerar att fältet Intern anteckning inte renderas. | Uttryckligt avvisande av ett AI-genererat test: ”Denna funktionalitet finns inte, så ta bort det testet.” | Det utpekade testet togs bort ur [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx); commit `d2f7dd1`. Användaren avvisade testet, inte den planerade anteckningsfeaturen. |
| 26 | Skapa framöver inte tester vars enda syfte är att kontrollera att element saknas eller inte syns. Regeln ska gälla detta repository. | Uttrycklig testpreferens och val av omfattning | Instruktionen gavs efter borttagningen i beslut 25 och sparades som repositorypreferens. Beslutet är inte evidens på att alla äldre tester i projektet har granskats eller ändrats. |
| 27 | Skapa ett dokument över vad som skulle göras annorlunda i ett riktigt projekt. Dokumentera att `handleCreated` och den manuella uppdateringsräknaren skulle ersättas med gemensam state-/server-state-hantering. | Uttrycklig dokumentationsbegäran, förtydligad med ”Ja, skulle ersättas med state management” | [Produktionsöverväganden](../production-considerations.md); commit `f746501`. Detta är ett framtida förbättringsförslag, inte ett beslut att införa state management i MVP:n. |
| 28 | Dokumentera att ett riktigt projekt bör ha tydligare felmeddelanden. | Uttrycklig dokumentationsbegäran | Avsnittet om mer vägledande felmeddelanden lades till i [produktionsövervägandena](../production-considerations.md); commit `444b72c`. Specifika meddelanden, nästa steg och teknisk loggning är dokumenterade förslag, inte genomförda produktionsförbättringar. |
| 29 | Fortsätt enligt planen med ärendedetalj, därefter statusändring och sedan intern anteckning, med separat commit efter respektive godkännande. | Upprepade uttryckliga instruktioner att implementera nästa steg och därefter göra commit | Steg 6–8 i [MVP-planen](../../plan.md); commits `444b72c`, `6392011` och `639e319`. Inga nya beslut om statusregler eller anteckningsregler behövdes; tidigare krav följdes. |

### Godkännanden 2026-11-02

- Bad om commit av teständringarna: `d2f7dd1`.
- Bad om commit av dokumentet med produktionsöverväganden: `f746501`.
- Angav uttryckligen ”Vi har granskat klart, gör en commit” för ärendedetaljen: `444b72c`.
- Bad om commit efter redovisningen av statussteget: `6392011`.
- Bad om commit efter redovisningen av anteckningssteget: `639e319`.

Commitbegärandena visar godkännande för commit. För status- och anteckningsstegen beskrev användaren inte vilka delar som granskades eller vilka kontroller som utfördes personligen. AI:ns rapporterade testresultat finns i respektive [featureticket](../features/README.md) och ska inte tillskrivas användaren som egna testkörningar.

## Godkännanden som påverkade arbetsflödet 2026-11-01

- Godkände projektskelettet och bad om commit innan steg 2.
- Godkände teaminstruktioner/skills och bad om commit innan steg 3.
- Godkände kravspecifikationerna efter att rullistornas testbarhet förtydligats.
- Godkände CASE-CREATE och CASE-LIST; varje godkänt steg committades separat.
- Godkände examinationsunderlaget för commit efter att sessionsevidensen sparats.

## Viktiga öppna frågor

- Vilka två oberoende individuella extrauppgifter ska ni välja?
- Har båda teammedlemmarna granskat och godkänt valen i denna logg?
- Vilka alternativ vill ni jämföra, vilken risk vill ni testa och vilket AI-arbetsmoment kan ni jämföra före/efter för VG?
