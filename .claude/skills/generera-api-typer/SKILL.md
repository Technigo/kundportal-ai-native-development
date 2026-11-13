---
name: generera-api-typer
description: >
  Genererar TypeScript-typer från backendens OpenAPI-schema med openapi-typescript.
  Använd vid KSP-28 (TypeScript-typer från OpenAPI), när frontendens API-typer
  ska skapas eller uppdateras, eller när ett anrop ska följa kontraktet på /openapi.json.
---

# Generera API-typer

Ägare: Mustafa (desiboli). Granskare: Azalea (API-kontraktet). Källa: `docs/api-konventioner.md`, avsnitt 6.

Kontraktet är backendens `/openapi.json`. Typerna skrivs inte för hand.

## Gör så

1. Läs avsnitt 6. Backend körs på port **8010**. Frontend anropar via `/api` (Vite-proxyn tar bort prefixet).
2. Generatorn är `openapi-typescript`. Lägg inte till `@hey-api/openapi-ts` eller en egen klient.
3. Paketet finns inte i `frontend/package.json` än. Fråga innan det läggs till, om användaren inte redan bett dig göra KSP-28 (TypeScript-typer från OpenAPI).
4. Ett pnpm-skript i `frontend/` hämtar `http://localhost:8010/openapi.json` och skriver `frontend/src/api/schema.d.ts`. Filen committas, så typkollen går utan igång backend. Ingen redigerar den för hand.
5. Anrop i frontend använder de genererade typerna. Skriv hur man genererar om i `frontend/README.md`.

## Rör inte

- Ändra inte OpenAPI-kontraktet eller felmeddelanden som frontend redan använder. Det äger Azalea.
- Generera inte om typerna mot en annan port eller en sparad kopia, om inte backend på 8010 är otillgänglig och användaren sagt till.
