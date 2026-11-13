# Teknikval och arbetsfördelning

Problem, syfte, önskat resultat och avgränsning står i [kravspecen](specs/kravspec.md). Motiveringen till valen står i [beslut.md](beslut.md), och för testerna i [verifieringsplan.md](verifieringsplan.md#testnivå-och-motivering).

## Teknikval

| Del              | Val                      | Status                                                                                   |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Backend          | Python 3.10+ med FastAPI | Används på `main`.                                                                       |
| Lagring          | SQLite                   | Används på `main` sedan PR #2. Ärendena finns kvar när appen startas om.                 |
| Frontend         | React med Vite           | Kom med startprojektet och används.                                                      |
| Språk i frontend | TypeScript               | Används på `main` sedan PR #7.                                                           |
| Tester           | pytest (backend), Vitest och Testing Library med MSW (frontend) | Används på `main`. Frontendtesterna går mot mockar (MSW), så de körs på några sekunder utan backend. API-testerna körs mot en riktig server i stället för FastAPIs TestClient, så inget nytt beroende behövs, se [backenduppdraget](agentuppdrag/2026-11-02-backend-status-och-varden.md). Vilka tester som finns och varför de ligger på sin nivå står i [verifieringsplan.md](verifieringsplan.md). |
| Klientplattform  | Webbapp i webbläsaren    | Körs lokalt på den egna datorn, utan drift eller moln, enligt avgränsningen i [kravspec.md](specs/kravspec.md#avgränsning). |
| AI-verktyg       | Claude Code och Claude   | Används för kod, tester, dokumentation och agentuppdrag, se [ai-arbetssatt.md](ai-arbetssatt.md). |

Översikt över hur koden är uppbyggd finns i [CLAUDE.md](../CLAUDE.md). Hur man kör appen och testerna står i [README.md](../README.md).

## Arbetsfördelning

Alla hjälps åt, men var och en har ett huvudansvar.

| Person   | Huvudansvar             |
| -------- | ----------------------- |
| Otto     | Backend                 |
| Ruben    | Databas                 |
| Sravani  | Testning                |
| Nathalie | Frontend, dokumentation |

Fördelningen bestämdes vecka 4, se [veckostatus](veckostatus.md).
