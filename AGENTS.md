# Instruktioner för AI-agenter

Gäller alla AI-agenter som arbetar i det här repot (Claude Code, GitHub Copilot, Cursor, Codex m.fl.).

Teamet Jiriga bygger Kundserviceportalen: React + TypeScript + Vite i `frontend/`, FastAPI + SQLAlchemy + Alembic i `backend/`, MySQL via Docker Compose för lagring, Vitest och pytest för tester som körs i GitHub Actions.

## Läs innan du skriver kod

1. [docs/kravspecifikation.md](docs/kravspecifikation.md) – produktregler (K1–K8, Q1–Q7).
2. [docs/api-kontrakt.md](docs/api-kontrakt.md) – enda källan för endpoints, JSON-fält, maskinvärden och felformat.
3. Teamets code-design i [.claude/skills/code-design/](.claude/skills/code-design/): [SKILL.md](.claude/skills/code-design/SKILL.md) och den referensfil som gäller uppgiften.

| Arbetar du med … | Läs |
|---|---|
| Mappstruktur, ordlista, fältregler | [arkitektur.md](.claude/skills/code-design/references/arkitektur.md) |
| React, TypeScript, komponenter | [frontend.md](.claude/skills/code-design/references/frontend.md) |
| FastAPI, SQLAlchemy, Alembic, MySQL | [backend.md](.claude/skills/code-design/references/backend.md) |
| Tester | [tester.md](.claude/skills/code-design/references/tester.md) |
| Färger, layout, tillgänglighet, UI-texter | [ui-design.md](.claude/skills/code-design/references/ui-design.md) |

## Det viktigaste i korthet

- Kod på engelska, användartexter på svenska, kommentarer och commits på svenska. Ett ärende heter alltid `ticket` i koden.
- API:ts form ändras i `docs/api-kontrakt.md` först, aldrig bara i koden.
- Backend avgör alltid valideringen. Frontendens validering är bara snabb återkoppling.
- Fel får aldrig se ut som framgång: ingen optimistisk uppdatering, formulärvärden finns kvar efter fel. Vid `save_outcome_unknown` skickas skrivningen inte om automatiskt.
- Följ befintlig struktur. Lägg inte till bibliotek, mappar eller funktioner utanför kravspecifikationen utan att fråga.
- Schemaändringar kräver en Alembic-migration. Tester använder aldrig utvecklingsdatabasen.
- Fatta inte beslut som står under "Öppna beslut" i SKILL.md – fråga.
- Använd bara färger från `frontend/src/styles/tokens.css`.
- Bara påhittade uppgifter. `.env`, lösenord och databasfiler checkas aldrig in.
- Kör tester och typkontroll innan du säger att något är klart, och redovisa det faktiska utfallet – även om MySQL-integrationstesterna inte kunde köras.

Vid konflikt mellan den här filen och code-design-skillen gäller skillen. Vid konflikt med kravspecifikationen eller API-kontraktet gäller de.
