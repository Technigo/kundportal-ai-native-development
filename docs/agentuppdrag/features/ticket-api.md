# Agentuppdrag: backendens ticket API

**Ansvarig:** Danielle. **Status:** implementation och automatiserade tester genomförda på `feature/ticket-api`; mänsklig granskning är inte dokumenterad och frontendgruppens kontraktsgranskning återstår.

## Uppdrag

Implementera backendens ticket-API enligt kravspecifikationen och API-kontraktet: MySQL/Alembic-modell och migration, registrering, lista, detalj, statusändring, statusfilter, validering/felstruktur, CORS och ett explicit idempotent demo-kommando.

## Begränsningar och kontrollpunkter

- Arbeta från commit `7e170cb` på separat branch; ändra inte frontend, `main` eller `feature/backend-setup`.
- Testa migrationer och skrivningar endast mot `kundportal_test`; verifiera databas och användare före migration och rensning.
- Skapa inte schema eller demoärenden automatiskt vid applikationsstart.
- Radera inte utvecklingsdata eller volymer. Ändra inte inloggning, radering, kundregister eller andra produktfunktioner.
- Kontrollera happy paths, felvägar, gränslängder, rollback efter SQL-skrivning, oklart commitutfall, CORS och idempotent demo-seed.
- Granska API-kontraktets maskinvärden, datumformat, felstruktur och statuskoder med frontendgruppen innan gemensam integration.

## Underlag

Implementationens testresultat finns i [verifieringsplanen](../../verifieringsplan.md). API-baslinjen och vad frontendgruppen ska granska finns i [API-kontraktet](../../api-kontrakt.md). Ingen mänsklig kodgranskning eller frontendgruppsgodkännande påstås här.
