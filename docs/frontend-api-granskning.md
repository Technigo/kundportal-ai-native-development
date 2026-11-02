
# Frontendgranskning av API-kontrakt
Ansvarig: Nora Aljuburi Masamra
 
## Sammanfattning
API-kontraktet har granskats ur frontend- och UX-perspektiv.

## Fält
De JSON-fält som används vid registrering av ärenden motsvarar de fält som finns i UX-flödena:
- customer_id
- customer_name
- title
- description
- category
- priority

Ingen ytterligare information behövs för registreringsformuläret.

## Statusvärden
Backend använder engelska statusvärden:
- new
- in_progress
- waiting_for_customer
- closed

Frontend kan visa motsvarande svenska texter:
- Nytt
- Pågående
- Väntar på kund
- Avslutat

## Felhantering
API:t returnerar fältspecifika valideringsfel.

Frontend kan använda dessa för att visa felmeddelanden nära respektive formulärfält.
 
Exempel:
title → "Ange en rubrik."
Detta överensstämmer med UX-dokumentets principer för felhantering.

## Bedömning
Det nuvarande API-kontraktet bedöms vara tillräckligt för att implementera:
- Registrering av ärende
- Visning av ärendelista
- Visning av ärendedetaljer
- Statusändring
- Fältvalidering och felmeddelanden

Inga ytterligare integrationsbehov har identifierats vid denna granskning.