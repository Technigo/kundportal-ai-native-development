# Instruktioner för AI-agenter

Gäller alla AI-agenter som arbetar i det här repot (Claude Code, GitHub Copilot, Cursor, Codex m.fl.).

Teamet Jiriga bygger Kundserviceportalen: React + TypeScript (Vite) i `frontend/`, Python + FastAPI i `backend/`, SQLite för lagring, Vitest och pytest för tester.

## Code-design – läs innan du skriver kod

Teamets gemensamma code-design finns i [.claude/skills/code-design/](.claude/skills/code-design/). Läs [SKILL.md](.claude/skills/code-design/SKILL.md) och den referensfil som gäller uppgiften **innan** du skriver, ändrar eller granskar kod:

| Arbetar du med … | Läs |
|---|---|
| Mappstruktur, domänmodell, API, felformat | [arkitektur.md](.claude/skills/code-design/references/arkitektur.md) |
| React, TypeScript, komponenter | [frontend.md](.claude/skills/code-design/references/frontend.md) |
| Python, FastAPI, SQLite | [backend.md](.claude/skills/code-design/references/backend.md) |
| Tester | [tester.md](.claude/skills/code-design/references/tester.md) |
| Färger, layout, tillgänglighet, UI-texter | [ui-design.md](.claude/skills/code-design/references/ui-design.md) |

Krav och tester: [docs/kravspecifikation.md](docs/kravspecifikation.md) (K1–K8) och [docs/verifieringsplan.md](docs/verifieringsplan.md) (T01–T16, M01–M07).

## Det viktigaste i korthet

- Kod på engelska, användartexter på svenska, kommentarer och commits på svenska. Ett ärende heter alltid `ticket` i koden.
- Backend avgör alltid valideringen. Frontendens validering är bara snabb återkoppling.
- Fel får aldrig se ut som framgång: ingen optimistisk uppdatering, formulärvärden finns kvar efter fel.
- Följ mappstrukturen och lagren. Lägg inte till bibliotek, mappar eller funktioner utanför kravspecifikationen utan att fråga.
- Skriv tester i samma ändring som koden, med test-ID i testnamnet (t.ex. `test_t04_...`).
- Använd bara färger från `frontend/src/styles/tokens.css`.
- Bara påhittade uppgifter. Inga hemligheter eller databasfiler i git.
- Kör lint och tester innan du säger att något är klart, och redovisa det faktiska utfallet.

Vid konflikt mellan den här filen och code-design-skillen gäller skillen.
