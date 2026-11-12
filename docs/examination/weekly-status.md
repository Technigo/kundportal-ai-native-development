# Veckostatus — Grupp 7

Progressionen visas vecka för vecka. Commits och PR:er är länkade som spårbarhet.

---

## Vecka 5 (2026-11-01) — Uppstart och MVP-grund

**Planerat:**
- Sätta upp GitHub-projekt och fork.
- Bestämma teknikstack och arkitektur.
- Skapa projektskelett med instruktioner och skills.
- Specificera MVP-features med krav-ID:n.
- Implementera de första två vertikala featuresen: Skapa ärende och Lista ärenden.

**Genomfört:**
- [`d66e6186`](https://github.com/misael86/kundportal-ai-native-development/commit/d66e6186) — TypeScript/React/Vite/Express/SQLite-skelett. Misael.
- [`f48ff432`](https://github.com/misael86/kundportal-ai-native-development/commit/f48ff432) — Copilot-instruktioner och TDD-/UI-skills skapade. Misael.
- [`6533a3d2`](https://github.com/misael86/kundportal-ai-native-development/commit/6533a3d2) — Kravspecar för alla MVP-features med krav-ID:n. Misael.
- [`5922c139`](https://github.com/misael86/kundportal-ai-native-development/commit/5922c139) — Feature: Skapa ärende (API + webb + tester). Misael.
- [`d276745e`](https://github.com/misael86/kundportal-ai-native-development/commit/d276745e) — Feature: Lista ärenden (API + webb + tester). Misael.
- [`80c6ee5c`](https://github.com/misael86/kundportal-ai-native-development/commit/80c6ee5c) — Examinationsunderlag, kriteriematris och verifieringsplan. Misael.
- [`e7ca5335`](https://github.com/misael86/kundportal-ai-native-development/commit/e7ca5335) — Beslutslogg från planeringssessionen. Misael.

**Verifierat:**
- `npm test` — API och webb tester passerade (automatiskt).
- Manuell kontroll av att formulärvalidering och listan fungerade i webbläsaren.

**Osäkert/ofärdigt:**
- Resterande features (detalj, status, anteckning) återstod.
- Inga Playwright E2E-tester implementerade ännu.

**Nästa steg/ansvar:**
- Carter: implementera case-detail, case-status och case-note.

**Granskning:**
- Misael granskade egna features och lät Carter påbörja nästa steg.

**AI-arbetsflöde:**
- Copilot (GPT-6 Luna) användes för att planera arkitektur, skriva specifikationer och implementera de första featuresen stegvis med godkännande efter varje steg. Instruktioner och skills lades upp i `.github/` för återanvändbart arbetssätt.

---

## Vecka 6 (2026-11-02) — Feature-implementation: Detalj, Status och Anteckningar

**Planerat:**
- Implementera Ärendedetalj, Ändra status och Interna anteckningar.
- Dela upp tester i fokuserade enhetstester (ett beteende per test).
- Dokumentera produktionsöverväganden.

**Genomfört:**
- [`84b4039d`](https://github.com/misael86/kundportal-ai-native-development/commit/84b4039d) — Testerna i CaseForm delades upp i fokuserade tester. Carter.
- [`8612d641`](https://github.com/misael86/kundportal-ai-native-development/commit/8612d641) — Feature: Ärendedetalj (API + webb + tester). Carter.
- [`73b25628`](https://github.com/misael86/kundportal-ai-native-development/commit/73b25628) — Produktionsöverväganden dokumenterade. Carter.
- [`86179bc0`](https://github.com/misael86/kundportal-ai-native-development/commit/86179bc0) — Feature: Statusändring (API + webb + tester). Carter.
- [`e83cbd41`](https://github.com/misael86/kundportal-ai-native-development/commit/e83cbd41) — Feature: Interna anteckningar (API + webb + tester). Carter.
- [`95c32743`](https://github.com/misael86/kundportal-ai-native-development/commit/95c32743) — Beslutslogg uppdaterades med veckans beslut. Carter.

**Verifierat:**
- `npm test` — API och webb tester passerade.
- Manuella tester av statusflöden och anteckningar i webbläsaren.

**Osäkert/ofärdigt:**
- UI-design var ännu grundläggande. Redesign planerades.
- E2E-tester saknades.

**Nästa steg/ansvar:**
- Misael: Redesigna vyerna, komplettera alla features (redigera, radera), lägga till CI.

**Granskning:**
- Misael granskade Carters commits och beslutslogg.

**AI-arbetsflöde:**
- Carter använde Copilot för stegvis implementation av tre features med separata commits per godkänt steg.

---

## Vecka 7 (2026-11-09) — Redesign, komplettering och CI

**Planerat:**
- Redesigna hela UI:t med fliknavigation, expanderbara ärendekort och inline-redigering.
- Implementera Redigera ärende och Ta bort ärende.
- Lägga till CI-kravtäckningskontroll.
- Komplettera och atomisera alla kravspecar.

**Genomfört:**
- [`ab3a14aa`](https://github.com/misael86/kundportal-ai-native-development/commit/ab3a14aa) — Komplett redesign av list- och detaljvyer; Redigera och Ta bort ärende; atomiserade krav; funktionella tester för alla features. Misael.
- [`ec15722c`](https://github.com/misael86/kundportal-ai-native-development/commit/ec15722c) — CI-workflow med kravtäckningskontroll per PR. Misael.
- [`65ba0bd2`](https://github.com/misael86/kundportal-ai-native-development/commit/65ba0bd2) — UI-justering: enhetligt avstånd mellan vyer. Misael.
- [`9abc9c5e`](https://github.com/misael86/kundportal-ai-native-development/commit/9abc9c5e) — Instruktioner för kravmärkta tester. Misael.
- Öppnade [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25) (intern) och [PR #26](https://github.com/misael86/kundportal-ai-native-development/pull/26) för Carters granskning.

**Verifierat:**
- `npm test` — API 106/106 och webb 95/95 passerade.
- `npm run test:requirements` — 6/6 passerade.
- `npm run check:requirements -- HEAD` — 84 krav har testtitlar.
- `npm run build` — Godkänt.
- Manuell genomgång av alla ärendeflöden i webbläsaren; justerade att alla redigeringar sparas i ett steg (inte en i taget) och fixade dropdown-chevron som inte låg snyggt.

**Osäkert/ofärdigt:**
- Examinationsunderlaget behövde kompletteras.

**Nästa steg/ansvar:**
- Misael: Slutföra examinationsunderlag och individuell redovisning.
- Carter: Granska PR #26.

**Granskning:**
- Carter granskade [PR #26](https://github.com/misael86/kundportal-ai-native-development/pull/26) (Misaels redesign-branch) och godkände.

**AI-arbetsflöde:**
- Misael använde Copilot upprepade gånger för att föreslå kravuppdelningar och tester. Avvisade estetiska krav och tester som enbart verifierade utseende. Rättade AI-förslag som bara ändrade lokala delar utan att se helheten.

---

## Vecka 8 (2026-11-11–12) — Examinationsunderlag och inlämning

**Planerat:**
- Slutföra examinationsunderlaget: beslutslogg, conversation-log, verifieringsplan, kriteriematris.
- Skriva gruppunderlag och individuell redovisning.
- Markera slutversion i PR.

**Genomfört:**
- [`f0e356ef`](https://github.com/misael86/kundportal-ai-native-development/commit/f0e356ef) — Uppdaterat examinationsunderlag: conversation-log, ai-workflow, decision-log, verifieringsplan, criteria-matrix. Misael.
- [`49924d52`](https://github.com/misael86/kundportal-ai-native-development/commit/49924d52) — Uppdaterat criteria-matrix, verifieringsplan, gruppunderlag; lade till gruppresentation (HTML). Misael.

**Verifierat:**
- Samma testresultat som vecka 7 — inga kodändringar i detta steg.

**Osäkert/ofärdigt:**
- Slutversionslänk ska läggas in i PR-beskrivningen.
- Individuell redovisning laddas upp i Disco.

**Nästa steg/ansvar:**
- Misael: Slutför och ladda upp individuell redovisning i Disco.
- Misael: Lägg till slutversionslänk i PR.

**Granskning:**
- Misael granskade [PR #26](https://github.com/misael86/kundportal-ai-native-development/pull/26) — Carters bidrag under vecka 6, bekräftade att testerna var genomtänkta och att kod fungerade som förväntat.

**AI-arbetsflöde:**
- AI användes för att strukturera examinationsunderlaget. Misael granskade och korrigerade formuleringar för att de skulle stämma med faktiskt genomfört arbete.
