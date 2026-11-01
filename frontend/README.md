# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
pnpm dlx shadcn@latest add @boldkit/button
```

The project uses the BOLDkit registry (`@boldkit` in `components.json`), not the default shadcn catalog. Components land in `src/components/ui`.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## API-typer

`src/api/schema.d.ts` genereras från backendens `/openapi.json` med `openapi-typescript`. Skriv inte i filen. När kontraktet ändras genererar du om, så att ändringen syns som typfel i frontend.

Starta backenden på port 8010 (se rotens README). I `frontend/`:

```bash
pnpm generate:api
```

Skriptet hämtar `http://localhost:8010/openapi.json` och skriver om `src/api/schema.d.ts`. Filen committas, så `pnpm typecheck` går utan att backenden är igång.
