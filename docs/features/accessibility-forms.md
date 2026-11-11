# ACCESSIBILITY-FORMS — Tillgängliga kontroller och begriplig feedback

## Leverans

Interaktiva kontroller kan identifieras och användas, och användaren får veta vad som behöver rättas när en åtgärd inte kan genomföras.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| ACCESSIBILITY-FORMS-001 | Fält i formulär för att skapa, redigera, statusändra och anteckna har tillgängliga namn som beskriver vad användaren ska ange eller välja. |
| ACCESSIBILITY-FORMS-002 | När obligatoriska fält saknas stoppas inskickning. Berörda fält markeras ogiltiga, och deras svenska felbesked är kopplade till fälten så hjälpmedel kan läsa dem. |
| ACCESSIBILITY-FORMS-003 | Ärendestatus visas som text och kan inte enbart utläsas via färg. |
| ACCESSIBILITY-FORMS-004 | API-fel visas på svenska som begriplig, tillgänglig feedback. |
| ACCESSIBILITY-FORMS-005 | När inskickning stoppas av valideringsfel i formulären för att skapa eller redigera ärenden flyttas fokus till det första ogiltiga fältet. |
| ACCESSIBILITY-FORMS-006 | När användaren byter vy via huvudmenyn flyttas fokus till vyns huvudrubrik och sidans titel uppdateras så att den beskriver vyn. |
| ACCESSIBILITY-FORMS-007 | När ett ärende expanderas flyttas fokus till ärendets rubrik i detaljvyn. När ärendet fälls ihop återgår fokus till ärendets expanderingsknapp. |
| ACCESSIBILITY-FORMS-008 | När redigering startar flyttas fokus till det första redigerbara fältet. När redigering avbryts återgår fokus till knappen som startade redigeringen. |
| ACCESSIBILITY-FORMS-009 | Bekräftelsedialogen för borttagning kan stängas med Escape. När dialogen stängs utan borttagning återgår fokus till knappen som öppnade den. Efter en genomförd borttagning flyttas fokus till nästa ärendes expanderingsknapp, till föregående ärendes expanderingsknapp om det borttagna ärendet var sist i listan, eller till listans rubrik om listan blir tom. |

## Implementation och teststatus

- ACCESSIBILITY-FORMS-001 till 005 har kravmärkta tester i den här arbetsytan.
- ACCESSIBILITY-FORMS-006 har kravmärkta tester här.
- ACCESSIBILITY-FORMS-007 har kravmärkt test här.
- ACCESSIBILITY-FORMS-008 har kravmärkta tester här.
- ACCESSIBILITY-FORMS-009 saknar ännu kravmärkta testtitlar här och är därför inte verifierat som klart.
- Att beteendet finns i koden eller täcks av tester märkta med andra krav-ID:n räknas inte som verifierad kravtäckning för 009.

## Testmappning

| Krav-ID | Automatiserad kontroll | Resultat |
|---|---|---|
| ACCESSIBILITY-FORMS-001 | [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx), [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx), [CaseStatusForm.test.tsx](../../packages/web/src/CaseStatusForm.test.tsx), [CaseNoteForm.test.tsx](../../packages/web/src/CaseNoteForm.test.tsx) | **Kört**, testfilerna passerade. |
| ACCESSIBILITY-FORMS-002 | [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx), [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx) | **Kört**, felkoppling och stoppad uppdatering kontrolleras. |
| ACCESSIBILITY-FORMS-003 | [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx) | **Kört**, status kontrolleras som text. |
| ACCESSIBILITY-FORMS-004 | [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx) | **Kört**, API-valideringsfel visas som tillgänglig feedback. |
| ACCESSIBILITY-FORMS-005 | [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx), [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx) | **Kört**, fokus flyttas till Rubrik efter ogiltig inskickning i skapa- och redigeringsformuläret. |
| ACCESSIBILITY-FORMS-006 | [App.test.tsx](../../packages/web/src/App.test.tsx) | **Kört**, efter menybyte får vyns rubrik fokus och sidtiteln uppdateras. |
| ACCESSIBILITY-FORMS-007 | [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx) | **Kört**, fokus går till detaljrubriken vid expandering och tillbaka till knappen vid hopfällning. |
| ACCESSIBILITY-FORMS-008 | [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx) | **Kört**, Rubrik får fokus när redigering startar och fokus återgår till knappen när den avbryts. |
| ACCESSIBILITY-FORMS-009 | Inga kravmärkta tester ännu. | **Återstår.** |

## Definition av färdig

- Kontroller har tillgängliga namn, kan användas med tangentbord och har synlig fokusindikering.
- Valideringsfel är kopplade till berörda fält och går att uppfatta med hjälpmedel.
- Status och API-fel kommuniceras med text, inte enbart med färg eller visuell utformning.
- Fokus hanteras förutsägbart vid valideringsfel, vybyte, expandering, redigering och dialoger.
- Samtliga krav-ID:n täcks av kravmärkta tester som passerar.

## Verifiering

Kört 2026-11-11:

- `npm test --workspace @kundportal/web -- src/CaseForm.test.tsx src/CaseDetail.test.tsx` — 2 testfiler passerade, 47 tester godkända.
- `npm test --workspace @kundportal/web -- src/App.test.tsx` — 1 testfil passerade, 9 tester godkända.
- `npm test --workspace @kundportal/web -- src/CaseList.test.tsx` — 1 testfil passerade, 13 tester godkända.
- `npm test --workspace @kundportal/web -- src/CaseDetail.test.tsx` efter ACCESSIBILITY-FORMS-008 — 1 testfil passerade, 34 tester godkända.
- `npm test` efter ACCESSIBILITY-FORMS-008 — API: 106 tester och webb: 105 tester passerade.
- `npm run build` efter ACCESSIBILITY-FORMS-008 — API TypeScript-build och Vite-produktionsbygge passerade.
- `npm run check:requirements -- origin/main` — **underkänd**: ACCESSIBILITY-FORMS-009 saknar matchande testtitel och nytt testfall.

Manuell kontroll med tangentbord och hjälpmedel är inte dokumenterad.