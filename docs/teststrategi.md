# Teststrategi och verifiering

> **Huvudversion** för hur teamet testar och verifierar. Gäller kärnan, historiken, frontend
> och tilläggsfunktioner. Ändras bara här, via PR. Verifieringsplanen med körresultat finns i
> `docs/verifiering.md` (ägs av Nicklas).
> Ansvarig: Nicklas (verifiering) och Azalea (HIST). Flyttad från Linear till repot 2026-10-25.

## 1. Principer

- Varje test hör till ett **krav-id** (CORE-xx, HIST-xx), som står i testets namn eller
  docstring, i Linear-ärendet och i PR:en.
- Happy paths, relevanta error paths och utvalda gränsfall, inte täckningsprocent.
- Den som äger en del skriver testerna för den. Andra granskar.
- Ett test ska **falla av rätt anledning**. Det kontrolleras med mutationsprövning (avsnitt 3).
- Tester körs före varje commit och i CI på varje PR. Ett fallerande test tas aldrig bort utan
  att teamet godkänner det.
- Körresultat sparas i Verification-ärendet i Linear och i `docs/verifiering.md`.

## 2. Testnivåer

| Nivå | Vad | Verktyg | Täcker | Ansvarig |
| --- | --- | --- | --- | --- |
| Enhet och integration | Statusregler (samma status, giltiga värden, återöppning). Integrationstestet visar statuskoden och att ingen post finns i databasen | pytest, TestClient, temporär fil | HIST-06, 07, 13 | Nicklas |
| Enhet / integration | Validering i kärnan (obligatoriska fält, gränsvärden) | pytest + TestClient, Hypothesis för gränsvärden | CORE-kriterierna | Nicklas |
| Integration (API + riktig SQLite-fil) | Hela kedjan router → service → databas | pytest + TestClient, temporär fil | HIST-01–03, 08, 10–12 | Azalea |
| Integration, omstart | Ny engine och session mot samma fil | pytest, temporär fil | HIST-04 | Azalea |
| Integration, fel injicerat | Tvinga historikinsättning att kasta fel | pytest + monkeypatch | HIST-09 | Azalea |
| API mot schemat | Inga 5xx, felsvar enligt schemat | Schemathesis | CORE-16, 17, HIST-14 | Azalea |
| Komponent | Lista, formulär, statusbyte | vitest + Testing Library | Frontend (CORE) | Mustafa |
| Komponent | Tidslinjen och hur felmeddelanden visas | vitest + Testing Library, jest-axe | HIST-05, UI-delen av HIST-14 | Amalia |
| Mutation | Testerna faller av rätt anledning | se avsnitt 3 | | Azalea, Nicklas |
| Manuell | Begripliga meddelanden, helhetsflöde i UI | Checklista i `docs/verifiering.md` | HIST-14, demoflödet | Nicklas |

**Varför integrationsnivå för backend:** kraven handlar om samspelet mellan API, regler och
lagring. Enhetstester med mockad databas kan inte visa att data finns kvar efter omstart
(HIST-04) eller att status och historik sparas tillsammans (HIST-09). Test genom webbläsaren
skulle också täcka dem, men är långsammare och skörare utan att visa mer.

**Invariant** (kontrolleras efter varje integrationsscenario för HIST): historikens senaste
`to_status` är lika med ärendets `status`.

## 3. Mutationsprövning, korsvis

Syfte: visa att testerna fångar de risker de ska fånga, och inte bara är gröna.

**Steg 1, egna tester.** En mutation i taget. Kör testerna och visa att rätt test faller av
rätt anledning.

| Mutation | Ska fångas av | Ägare |
| --- | --- | --- |
| Historikinsättningen tas bort | HIST-01, 02, 03 | Azalea |
| `commit` sker före historikinsättningen | HIST-09 | Azalea |
| `commit` tas bort (bara `flush`) | HIST-04 | Azalea |
| 409-kontrollen för samma status tas bort | HIST-07 | Nicklas |
| Tom rubrik accepteras | CORE-06, CORE-11 | Nicklas |
| Gränsen `<= 100` ändras till `< 100` | CORE-12 | Nicklas |

Tabellen visar ett urval. Fler mutationer för kärnan finns i [CORE-specen](specs/SPEC-karna.md), avsnitt 6, och för historiken i [HIST-specen](specs/SPEC-arendehistorik.md), avsnitt 10.

Var och en prövar bara **sina egna** tester i steg 1. Steg 1 görs och dokumenteras (körresultat
i Verification-ärendet) innan steg 2 börjar, så att det syns vem som hittade vad.

**Steg 2, korsvis.** Den andra lägger in en mutation som testförfattaren inte känner till i
förväg. Testförfattaren visar vilket test som faller och varför. Mutationen i steg 2 är ett
tillägg till steg 1, inte en ersättning.

**Om ett test är grönt trots mutationen:** den som skrev testet förbättrar det och sparar
före/efter.

**Verktyg:** inget mutationsverktyg för Python kan ta bort en ensam `commit()`, så de
utvalda mutationerna görs **för hand** med körresultat. `pytest-gremlins` (fungerar på
Windows) kan komplettera för jämförelser och gränser. `mutmut` kräver WSL.

## 4. Instruktion för testförslag (AI)

- **v1** ([`docs/ai/testforslag-v1.md`](ai/testforslag-v1.md)) skrivs av Nicklas och används av
  alla för att få testförslag från AI utifrån ett krav-id.
- Var och en gör sedan en **egen, namngiven förbättring** utifrån en begränsning hen hittat,
  prövar den på sina egna kriterier och jämför med v1. Vi granskar varandras förbättringar,
  men skriver dem inte åt varandra.
- **v1 ändras bara för fel och otydligheter.** Förbättringar läggs i den egna, namngivna
  versionen och inte i v1, så att varje förbättring kan jämföras mot samma v1.
- Varje användning sparas med förslaget, vad som accepterades, ändrades eller avvisades, och
  varför.

## 5. Kommandon

```powershell
cd backend
.\.venv\Scripts\python -m pytest -q             # alla backendtester (Windows)
.\.venv\Scripts\python -m pytest -q -k history  # bara historiktester
```

```bash
cd backend
.venv/bin/python -m pytest -q                   # macOS/Linux
```

```powershell
cd frontend
pnpm lint
pnpm build
pnpm test:run
```

CI kör backendens tester och frontendens lint, build och vitest på varje PR (`.github/workflows/tests.yml`).

## 6. Koppling till Linear

- Varje testområde har ett **Verification**-ärende under milstolpe 05 · Testing &
  Verification, med krav-id, testfiler, körresultat och svaret på "faller testet av rätt
  anledning?".
