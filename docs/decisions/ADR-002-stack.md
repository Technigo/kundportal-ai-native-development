# ADR-002: Teknikstack för Kundserviceportalen

> Status: **beslutat** · Ansvarig: Nicklas (yrrving) · Datum: 2026-10-25, avsnitt 3 ändrat 2026-10-29 (BOLDkit)
> Underlag: Slack 2026-10-21–25, teammötet 2026-10-25, PR #3 (backendskelett: FastAPI, SQLite och /health): https://github.com/desiboli/kundportal-ai-native-development/pull/3 och PR #11 (frontend-skelett med React, Vite och TypeScript): https://github.com/desiboli/kundportal-ai-native-development/pull/11.

## Kontext

Uppgiften lämnar teknikvalet till gruppen men ställer några krav som styr valet:

- Lösningen ska ha användargränssnitt, backendlogik och **beständig lagring** (ärenden finns kvar efter omstart).
- Den ska kunna **köras lokalt av någon annan** med hjälp av instruktionerna, utan personligt betalkonto.
- Centrala beteenden ska verifieras med **automatiserade tester**.
- Vi är fyra personer med olika vana (backend, frontend, test) och olika AI-verktyg (Claude, Cursor, ChatGPT). Tiden är kort: demo vecka 8.

Stacken diskuterades i Slack och landade under mötet 2026-10-25, när backend- och frontendskeletten redan fanns. Det här dokumentet skriver ner besluten och varför.

## Beslut

| Del | Val |
| --- | --- |
| Backend | Python 3.11 + FastAPI, körs med uvicorn på port 8010 |
| Databas | SQLite (en fil) via SQLAlchemy 2 |
| Backendtester | pytest + FastAPIs TestClient |
| Frontend | React + Vite + TypeScript |
| Utseende | Tailwind CSS + shadcn/ui (stil "Luma") med registret BOLDkit (tema och komponenter), grundkomponenter från Base UI |
| Pakethanterare (frontend) | pnpm |
| Struktur | `backend/` och `frontend/` som separata mappar i samma repo, inte ett monorepo-verktyg |

Exakta versioner står i `backend/requirements.txt` och `frontend/package.json`, och de filerna gäller om något här skiljer sig.

## Alternativ och avvägning

### 1. Backend: FastAPI eller TypeScript hela vägen

| | FastAPI (Python) | Node + Express/Fastify (TypeScript) |
| --- | --- | --- |
| För | Inbyggd validering via Pydantic passar kravet på obligatoriska fält. Automatisk API-dokumentation (Swagger). Backend-ansvarig har byggt liknande förut. | Ett språk i hela stacken. Delade typer mellan frontend och backend utan extra steg. |
| Emot | Två språk i projektet. Typerna i frontend måste hållas i synk med backend. | Validering och API-dokumentation måste byggas eller väljas till. Ingen i teamet har pekat ut det som sin styrka för backend. |

**Valt: FastAPI.** Den inbyggda valideringen gör det enkelt att bygga och testa kraven i CORE-specen. Valet följer också den som ansvarar för backend. Nackdelen med två språk minskas genom att TypeScript-typerna genereras från API:ts OpenAPI-schema (`openapi-typescript`), se Konsekvenser.

### 2. Databas: SQLite

Alternativ: PostgreSQL eller en JSON-fil. PostgreSQL kräver en databasserver, vilket gör det svårare för någon annan att köra lösningen. En JSON-fil saknar transaktioner, som historiken behöver ([ADR-001](ADR-001-atomicitet-status-och-historik.md)). **SQLite** är en vanlig fil, kräver ingen installation och klarar både beständighet och transaktioner. Nackdelen är att bara en skrivning åt gången går igenom. Det räcker för en app som körs lokalt av en person, men inte för många samtidiga användare.

### 3. Utseende: vanliga shadcn/ui, ett register eller bara Tailwind

| | Vanliga shadcn/ui | Tredjepartsregister (t.ex. BOLDkit) | Bara Tailwind |
| --- | --- | --- | --- |
| För | Officiellt, MIT-licens, mycket använt. Tillgängliga grundkomponenter. AI-verktygen känner till det väl. Teman kan ändras senare. | Mer unikt utseende direkt. Bygger ovanpå shadcn. | Inget beroende. |
| Emot | Ser mer "standard" ut. | Små projekt: licens, underhåll och tillgänglighet måste kontrolleras. | Vi bygger varje komponent själva, vilket tar tid. |

**Valt: BOLDkit** (teammötet 2026-10-27, infört i PR #38 (BOLDkit-tema med badge och card): https://github.com/desiboli/kundportal-ai-native-development/pull/38). Först valdes vanliga shadcn/ui tills vidare (2026-10-25), och Amalia provade register på en egen branch. Teamet gillade hennes BOLDkit-test: utseendet är bestämt en gång, så ingen behöver fundera på hur knappar och kort ska se ut. Bytet gäller bara temat och komponenterna. Grundkomponenterna är fortfarande Base UI (avsnitt 4), så BOLDkits knapp, som bygger på Radix, har fått sin stil flyttad till Base UI-knappen.

Det här kontrollerades mot "Emot" i tabellen (2026-10-29): BOLDkit har MIT-licens (https://github.com/ANIBIT14/boldkit) och uppdaterades senast 2026-10-20, men har bara en utvecklare. MCP-servern `@boldkit/mcp` finns bara i version 0.1.0 och är därför låst till den versionen i PR #47 (skills för testförslag, API-typer och BOLDkit): https://github.com/desiboli/kundportal-ai-native-development/pull/47. Tillgängligheten kommer från Base UI. Färgerna och kontrasten i temat är inte kontrollerade än. Om BOLDkit slutar underhållas påverkas inget som redan är installerat, eftersom komponenterna kopieras in i `frontend/src/components/ui/`. En gemensam instruktion (skillen `boldkit`) gör att alla agenter hämtar från BOLDkit och lämnar temat orört.

### 4. Grundkomponenter: Base UI eller Radix

shadcn/ui kan bygga på Radix eller Base UI. Båda ger tillgängliga komponenter (tangentbord, fokus, skärmläsare). Base UI är nyare och är det shadcn nu föreslår som standard. **Valt: Base UI** (förvalt i skelettet, PR #11 (frontend-skelett med React, Vite och TypeScript): https://github.com/desiboli/kundportal-ai-native-development/pull/11). Ingen i teamet hade starkare önskemål, och skillnaden märks inte i vårt flöde.

Risk: AI-verktygen har sett mer kod för Radix än för Base UI och kan föreslå Radix-mönster. Det fångas i granskningen och i instruktionen för designsystemet.

### 5. Pakethanterare: pnpm eller npm

npm följer med Node och kräver inget extra. **Valt: pnpm**, som Musse rekommenderade från sina projekt: snabbare installation och bättre skydd mot skadliga paket. pnpm kör inte paketens installationsskript om de inte uttryckligen tillåts. Det syns i `frontend/pnpm-workspace.yaml`, där bara `esbuild` får köra sitt skript. Nackdelen är ett steg till för den som ska köra projektet (pnpm måste installeras, t.ex. via `npm install -g pnpm` eller `corepack enable`).

### 6. Struktur: separata mappar eller monorepo

Skelettverktyget erbjöd ett monorepo. **Valt: separata mappar** (`backend/`, `frontend/`) i samma repo, eftersom backend och frontend använder olika språk och verktyg och har olika ansvariga. Det gör också att var och en kan köra sin del utan att förstå hela bygget.

## Konsekvenser

- **Att köra lösningen kräver Python 3.11, Node och pnpm.** README behöver beskriva alla tre, även för Windows.
- **SQLite kontrollerar inte främmande nycklar som standard.** Backenden måste slå på det med `PRAGMA foreign_keys=ON` för varje anslutning, annars kan en historikpost peka på ett ärende som inte finns.
- **Två språk:** typerna i frontend kan glida isär från backend. Därför genereras TypeScript-typerna från API:ts OpenAPI-schema med `openapi-typescript` (KSP-28), beslutat på teammötet 2026-10-27 och på plats sedan PR #58 (generera TypeScript-typer från OpenAPI): https://github.com/desiboli/kundportal-ai-native-development/pull/58. Typerna skapas med `pnpm generate:api` när backenden körs.
- **Frontendtester:** Vitest, jsdom, Testing Library och jest-axe finns i `frontend/` sedan PR #53 (förslag på testverktyg, KSP-64): https://github.com/desiboli/kundportal-ai-native-development/pull/53.
- **Sidor i frontend:** `react-router` ger egna adresser till listan (`/`) och detaljvyn (`/tickets/:id`). Det kom in med PR #59 (ärendelista, KSP-29): https://github.com/desiboli/kundportal-ai-native-development/pull/59 och valdes i Slack 2026-10-30 framför adresser med `#`, som hade klarat sig utan ett nytt beroende.
- **Designsystemet:** nya beroenden `clsx` och `tailwind-merge`, och typsnittet Outfit, som ersätter Inter (PR #38 (BOLDkit-tema med badge och card): https://github.com/desiboli/kundportal-ai-native-development/pull/38). När PR #47 (skills för testförslag, API-typer och BOLDkit): https://github.com/desiboli/kundportal-ai-native-development/pull/47 är mergad följer agenterna skillen `boldkit`, så att utseendet inte ändras vid varje ny komponent.
- **Kontrasten i BOLDkit-temat** är inte kontrollerad. Den behöver prövas innan demon, se Öppna frågor.

## Öppna frågor

| Fråga | Ägare | När |
| --- | --- | --- |
| Vilken Node-version gäller (anges i README)? | Musse | Med frontendens körinstruktioner |
| Klarar BOLDkit-temat kontrastkraven (text mot bakgrund, statusbrickor)? | Amalia (svar i PR #50 2026-10-30) | Före demon |

## Ändringar

| Datum | Vad |
| --- | --- |
| 2026-10-25 | Första versionen, efter teammötet |
| 2026-10-29 | Avsnitt 3: BOLDkit valt (teammötet 2026-10-27, PR #38 (BOLDkit-tema med badge och card): https://github.com/desiboli/kundportal-ai-native-development/pull/38). Licens och underhåll kontrollerade. Status satt till beslutat |
| 2026-11-02 | Konsekvenser: typerna från OpenAPI och testverktygen i frontend är på plats (PR #58, PR #53), `react-router` tillagt (PR #59). Amalia äger frågan om kontrasten |
