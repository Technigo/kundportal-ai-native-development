# Agentuppdrag: Dokumentationsstruktur

- **Ansvarig:** Nathalie & Ruben
- **Datum:** 2026-10-29
- **Agent och verktyg:** Claude Code (Claude Opus 5.5)
- **PR:** https://github.com/Ottowski/nors-kundportal-development/pull/4 

## Före

### Mål

Samla dokumentationen i `docs/` som enda källa för spec-drivet arbete, så att `frontend-v2` kan verifieras mot specen. Krav och acceptanskriterier ändras inte i sak; uppdraget gäller strukturen. Inga R# eller A# implementeras.

### Kontext

Kursmaterial i tillfälliga filer (`tillfallig.md`, `examination.md`, `indid.md`), allt i `docs/`, `README.md` och `CLAUDE.md`.

### Avgränsning

- **Får ändras:** `docs/`, `README.md`, `CLAUDE.md` och PR-mallen.
- **Får inte ändras:** kod i `backend/` och `frontend/`, kravens och acceptanskriteriernas innehåll (de får bara flyttas och numreras), `notes.md`.

### Faktiska behörigheter

Agenten kunde läsa och skriva filer och köra skalkommandon i repot. `CLAUDE.md` förbjuder git-kommandon och åtkomst till `frontend/.env.local` och `backend/.env`. Verktyget hindrade inte git tekniskt, så den gränsen vilade på instruktionen. Ruben skötte all git.

### Kontrollpunkter

Agenten skulle läsa filerna och ställa frågor innan något ändrades. Varje strukturfråga besvarades av teamet innan ändringarna gjordes.

### Klart när

Besluten nedan är genomförda, inga interna länkar i `docs/` är trasiga (utom `sok-filter.md`, som skrivs i nästa steg) och teamet har granskat diffen.

### Instruktionen

Sammanfattning av uppdraget: gå igenom filerna och ställ frågor om planen som vi kan ta ställning till, så att det inte blir antaganden från agentens sida utan beslut vi står bakom.

## Efter

### Plan och vårt beslut

Agenten ställde frågorna i två omgångar. Teamet beslutade:

- En kravspec för kärnflödet och en fil per tillägg.
- Uppdragstexten ordagrant i `docs/uppdrag.md`, plus en tabell i kravspecen över var uppdragets krav täcks (tabellen godkändes efter granskning).
- Problem, syfte och avgränsning bara i kravspecen.
- Öppna frågor i respektive spec; `oppna-fragor.md` tas bort.
- `beslut.md` bara för projektövergripande beslut. Agentens första förslag med B#-id och en rad per beslut ändrades efter teamets invändning om merge-konflikter och onödiga uppdateringar mellan filer: spec-beslut skrivs i specen och inga B#-id används.
- Stabila id; tilläggsspecar får prefix.
- `spec-driven-dev.md` rensas och får avsnittet "Så arbetar vi".
- Det som är relevant för specar sparas från lektionsanteckningarna.
- Agentuppdrag i `docs/agentuppdrag/`; mallar i `docs/mallar/`, inklusive en redovisningsmall.
- `notes.md` är personlig och ingår inte.
- TypeScript och SQLite är beslutade; README och `CLAUDE.md` beskriver koden som den är på main.
- Svenska i `docs/` och README, engelska i `CLAUDE.md`; `CLAUDE.md` pekar på `docs/` utan att upprepa innehåll.
- Spårbarhetstabell i verifieringsplanen.
- Begränsningar i en egen fil, och kärnspecen heter `kravspec.md`.

### Granskning

- **Granskad av:** Ruben och Nathalie. Nathalie mergade [PR #4](https://github.com/Ottowski/nors-kundportal-development/pull/4), och specarna kom in i `main` 2026-11-02.
- **Vad vi hittade:**
  - Tabellen i kravspecen över var uppdragets krav täcks godkändes efter granskning.
  - Innehållet i `tillfallig.md`, `examination.md` och `indid.md` var flyttat till `docs/`. Därför raderades filerna 2026-10-30.
- **Arbete utanför uppdraget som togs bort:** Vi minns inte i detalj. Där agenten föreslog mer än projektet behövde valde vi det som passade projektets omfattning bättre. Till exempel togs `oppna-fragor.md` och B#-id bort, och tre filer per funktion valdes bort, se [beslut.md](../beslut.md) (2026-10-29).
- **Accepterat, ändrat eller avvisat, och varför:**
  - **Ändrat:** agenten föreslog B#-id och en rad per beslut i `beslut.md`. Vi invände att det ger merge-konflikter och onödiga uppdateringar mellan filer. Därför skrivs beslut om en spec i specen, och inga B#-id används.
  - **Accepterat:** övriga beslut under "Plan och vårt beslut".

### Verifiering

Agentens egna kontroller, som inte ersätter teamets granskning:

| Kommando | Resultat | Datum |
| -------- | -------- | ----- |
| `diff` mellan `docs/uppdrag.md` (utan inledningsraden) och `examination.md` | Identiska | 2026-10-29 |
| `diff` av avsnitten Beteendekrav och Acceptanskriterier mellan gamla `docs/specs/README.md` och `docs/specs/kravspec.md` | Enda skillnaden: hänvisningen i R11 är nu en länk | 2026-10-29 |
| `diff` av start- och granskningsprompten mellan `tillfallig.md` och `docs/ai-arbetssatt.md` | Ordagranna | 2026-10-29 |
| Länkkontroll av alla relativa länkar i `README.md`, `CLAUDE.md` och `docs/` (16 filer) | 3 trasiga, alla till `sok-filter.md` som inte är skriven ännu | 2026-10-29 |

### Avvikelser och öppna frågor

- `docs/specs/sok-filter.md` finns inte ännu; länkarna dit är trasiga tills den skrivs.
- Fält markerade `?` i `docs/beslut.md` behöver fyllas i.
- PR-mallen ändras inte; teamet bedömde att den nya strukturen räcker. Kursen kräver ändå länkar till underlaget och veckostatusen i den löpande PR:ens beskrivning (`indid.md` rad 112 och 121), så de läggs in direkt på GitHub.
- `tillfallig.md`, `examination.md` och `indid.md` låg kvar tills teamet hade granskat att innehållet var flyttat. De raderades 2026-10-30 och finns kvar i git-historiken.
