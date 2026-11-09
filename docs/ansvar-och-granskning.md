# Ansvar och granskning

> Teamets arbetsfördelning. **Alla rader bekräftades på teammötet 2026-10-25.** Repot är
> huvudversion. Linear-dokumentet "Gemensamt · Ansvar och granskning" pekar hit.
> Ändringar görs via PR.

## Princip

- Varje person äger ett eget, spårbart moment: spec eller del av spec, implementation,
  tester och verifiering för sin del.
- Var och en skriver testerna och gör förbättringarna för sin egen del. Andra
  **granskar**, men skriver inte varandras.
- Varje ändring går via en intern PR till forkens `main` och granskas av minst en annan i
  teamet innan merge. Granskningen görs i GitHub, så att det syns vem som granskade, vad
  som kontrollerades och vad återkopplingen ledde till.
- Krav-id (HIST-xx, CORE-xx) står i Linear-ärendet, i commit-meddelandet och i PR:en.

## Översikt per person

| Person (GitHub) | Huvudområde |
| --- | --- |
| **Azalea** (Azaalea) | Backend som helhet: skelett, kärnans API, statuslogik och historik, API-kontraktet |
| **Nicklas** (yrrving) | CORE-specen, tester för statusregler och validering, verifieringsplanen, teknikbeslutet om stacken |
| **Mustafa** (desiboli) | Frontend och Linear. Föreslaget 2026-11-01: frontend avgränsas till lista, formulär och genererade typer |
| **Amalia** (amaliaa-91) | Tidslinje (HIST-05) och UI-delen av HIST-14 (hur felmeddelanden visas). Föreslaget 2026-11-01: även detaljvy och statusbyte, testverktyg och CI för frontend |

## Ansvarstabell

| Del | Ansvarig | Granskare | Läge |
| --- | --- | --- | --- |
| **Backend som helhet:** skelett, SQLite, kärnans API (CORE) och `/health` | Azalea | Nicklas | Bekräftat 2026-10-25 |
| Statusregler, historik, transaktionsgräns, ADR-001 | Azalea | Nicklas | Bekräftat 2026-10-25 |
| API-kontrakt som OpenAPI (`/openapi.json`), klart innan frontend bygger mot det | Azalea | Mustafa | Bekräftat 2026-10-25 |
| Tester för historik, atomicitet och persistens: **HIST-01, 02, 03, 04, 08, 09, 10, 11, 12** och invarianttestet | Azalea | Nicklas | Bekräftat 2026-10-25 |
| Backend-delen av HIST-14: alla fel som `{"detail": "<svenska>"}` utan stacktrace eller databasdetaljer | Azalea | Nicklas | Bekräftat 2026-10-25 |
| Spec för kärnan (**CORE-01, 02 …**) | Nicklas | Azalea | Bekräftat 2026-10-25 |
| Tester för statusregler: **HIST-06, 07, 13** | Nicklas | Azalea | Bekräftat 2026-10-25 |
| Tester för kärnans validering (CORE-kriterierna) | Nicklas | Azalea | Bekräftat 2026-10-25 |
| Teamets verifieringsplan (`docs/verifiering.md`), HIST-raderna skrivs av Azalea | Nicklas | Azalea | Bekräftat 2026-10-25 |
| Teknikbeslut om stacken (jämförelse och beslut) | Nicklas | Alla | Bekräftat 2026-10-25 |
| Mutationsprövning, **korsvis**: var och en prövar sina egna tester, den andra lägger in en okänd mutation | Azalea, Nicklas | den andra | Bekräftat 2026-10-25 |
| Instruktion för testförslag: v1 | Nicklas | Azalea | Bekräftat 2026-10-25 |
| Förbättring av instruktionen: **var och en gör en egen, namngiven förbättring**, prövad på egna kriterier och jämförd med v1 | Azalea, Nicklas (var för sig) | den andra | Bekräftat 2026-10-25 |
| Frontend: lista och formulär för att skapa ärenden (KSP-29, KSP-30), TypeScript-typer från OpenAPI (KSP-28) | Mustafa | Azalea, Amalia | Bekräftat 2026-10-25, delning föreslagen 2026-11-01 |
| Frontend: detaljvy och statusbyte (KSP-31, KSP-32), med komponenttester | Amalia | Mustafa, Azalea | Föreslagen 2026-11-01, enligt Linear och veckostatus V6 |
| Testverktyg i frontend (vitest, Testing Library, jest-axe, KSP-64) och frontendtester i CI (KSP-18) | Amalia | Azalea | Föreslagen 2026-11-01, enligt Linear |
| Tidslinje (HIST-05) och UI-delen av HIST-14 (hur felmeddelanden visas), inklusive komponenttest för tidslinjen (vitest + Testing Library) | Amalia | Mustafa, Azalea | Bekräftat 2026-10-25 |
| Linear: milstolpar, ärenden och mallar (fält för krav-id och "faller testet av rätt anledning?") | Mustafa (mallarna: Nicklas) | Nicklas | Bekräftat 2026-10-25 |

## Granskningspar

| PR rör | Granskas av |
| --- | --- |
| Backend, statuslogik, historik | Nicklas |
| CORE-spec, tester för status och validering | Azalea |
| Frontend | Azalea (API-kontraktet), Amalia eller Mustafa (UI) |
| Amalias del | Mustafa och Azalea |

## Beslut på teammötet 2026-10-25

1. Stacken: FastAPI + SQLAlchemy + SQLite i backenden, React + Vite + TypeScript i frontenden. Jämförelsen står i `docs/decisions/ADR-002-stack.md`.
2. Alla rader i ansvarstabellen är bekräftade.
3. Amalias del: tidslinjen (HIST-05) och UI-delen av HIST-14. Backend-delen av HIST-14 (felformatet) är Azaleas.
4. Huvudversion för gemensamma dokument: repot. Linear används för planering och länkar hit.
