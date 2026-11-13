---
name: boldkit
description: >
  Bygger gränssnitt i kundserviceportalen med BOLDkit, teamets shadcn-registry
  och designsystem. Använd när du lägger till eller ändrar UI i frontend
  (sidor, formulär, listor, komponenter). Hämta från @boldkit och lämna temat.
---

# BOLDkit

Ägare: Amalia (amaliaa-91), temat. Mustafa lägger in komponenter i vyerna. Källa: `frontend/components.json` och `docs/decisions/ADR-002-stack.md` (Base UI).

BOLDkit är komponentbiblioteket och designsystemet. Agenten komponerar färdiga komponenter. Den designar inte vyn.

## Hämta en komponent

1. Om BOLDkit-MCP:n är ansluten: sök där först, så namnet finns i registret.
2. Från `frontend/`:

```bash
pnpm dlx shadcn@latest add @boldkit/<namn>
```

Registret står i `frontend/components.json` (`@boldkit` → `https://boldkit.dev/r/{name}.json`). Importera från `@/components/ui/…`. Grundkomponenterna är Base UI (`@base-ui/react`), inte Radix.

## Rör inte

- Lägg inte till från shadcn:s standardkatalog (`shadcn add button` utan `@boldkit`).
- Ändra inte färger, skuggor, typsnitt eller `frontend/src/styles/globals.css` för att en vy ska se bra ut. Temat är redan installerat.
- Bygg inte en egen primitiv när BOLDkit saknar den. Säg vilket namn du sökte och stanna.
- Visa statuskoder och feltexter som API-konventionerna säger: svenska etiketter från den enda tabellen, och `detail` som det är.
