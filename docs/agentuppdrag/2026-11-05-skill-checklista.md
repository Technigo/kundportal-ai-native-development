# Agentuppdrag: Checklista i skillen verifiera-mot-spec

- **Ansvarig:** Nathalie
- **Datum:** 2026-11-05
- **Agent och verktyg:** Claude Code (Opus 5.5) i VS Code, Plan mode, med skillen `verifiera-mot-spec`
- **PR:** [#9](https://github.com/Ottowski/nors-kundportal-development/pull/9)

## Före

### Mål

Pröva om skillen [verifiera-mot-spec](../../.claude/skills/verifiera-mot-spec/SKILL.md) kan förbättras så att en agent hittar svagheter i frontendtester mer pålitligt.

Bakgrund: när frontenden rättades mot specen ([frontenduppdraget](2026-11-03-frontend-mot-spec.md)) användes skillen, men svagheter i A8 och A9 missades. Ett test hade en kontroll som aldrig kunde misslyckas, och ett annat kontrollerade inte övriga fält. De hittades först när jag granskade PR #7 och i mitt [uppdrag för A8 och A9](2026-11-04-a9-test.md).

Testet som granskades är A4 i `frontend/src/components/ArendeForm.test.tsx`. Det har inte rättats, och det använder en låtsad backend på samma sätt som A9 gjorde.

### Kontext

Agenten fick bara instruktionen nedan. Den läste själv skillen, specen och testfilen. Mina anteckningar och facit var stängda, så att de inte kom med.

### Avgränsning

- **Får ändras:** inget. Agenten granskar bara.
- **Ändras av mig:** `.claude/skills/verifiera-mot-spec/SKILL.md` (checklistan) och det här agentuppdraget.
- **Ingår inte:** att rätta A1–A4. Fynden lämnas till teamet.

### Faktiska behörigheter

Varje körning gjordes i en ny Claude Code-chatt i Plan mode, där agenten inte kan ändra filer. Agenten fick inte köra git enligt `CLAUDE.md`.

### Kontrollpunkter

Agenten stannade efter sin rapport. Jag svarade inte och godkände ingen plan.

### Klart när

- Den gamla och den nya skillen har prövats på samma uppgift med samma instruktion, modell och läge.
- Resultaten är jämförda mot samma lista med svagheter.
- Begränsningarna är beskrivna.

### Instruktionen

Körning 1 gällde bara A4. Körning 2, 2b och 3 gällde A1–A4 med exakt samma text:

> Använd skillen .claude/skills/verifiera-mot-spec/SKILL.md för att granska acceptanskriterierna A1, A2, A3 och A4 i frontenden: testerna i frontend/src/components/ArendeForm.test.tsx mot docs/specs/kravspec.md.
>
> Ändra inga filer och kör inga git-kommandon. Följ skillen och rapportera vad du hittar för varje kriterium: stämmer testet med specen, och finns det svagheter i testet? Ange radnummer.

Instruktionen säger inte vad agenten ska leta efter. Då är det skillen som prövas och inte instruktionen.

## Efter

### Plan och mitt beslut

Jag prövade två hypoteser, och båda var fel:

1. **"Skillen saknar regeln att varje kontroll ska kunna misslyckas."** Körning 1 med den gamla skillen hittade ändå den kontroll i A4 som aldrig kan misslyckas, genom steg 4 i verifieringsplanen.
2. **"En agent granskar ytligare när den får fler kriterier på en gång."** Körning 2 med fyra kriterier hittade färre svagheter, men körning 2b med exakt samma instruktion hittade lika många som körning 1.

Det som syntes var att **svaren varierade mellan körningarna**. Varje körning hittade något som de andra missade, och ingen hittade allt. Skillen säger hur ett test ska granskas, men inte vad som ska kontrolleras, så agenten väljer själv varje gång.

**Förbättringen:** en checklista med sju punkter i skillen, byggd på allt som körningarna hittade tillsammans. Agenten ska svara på varje punkt för varje test, med radnummer.

### Granskning

Varje svar jämförde jag med samma lista över svagheter i A4. Listan kommer från min egen läsning av testet och från alla körningarnas fynd. Rad 116 hade jag själv hittat innan körningarna, eftersom det är samma mönster som i A9.

- **Granskad av:** Nathalie
- **Vad jag hittade:** se Verifiering.
- **Arbete utanför uppdraget som togs bort:** inget.
- **Accepterat, ändrat eller avvisat, och varför:**
  - **Accepterat:** checklistan, eftersom den nya skillen hittade fler svagheter i en enda körning.
  - **Avvisat:** mina två första hypoteser, eftersom resultaten inte stödde dem.

### Verifiering

Svagheter i A4 som respektive körning hittade:

| Svaghet i A4                                                         | 1: gamla, ett kriterium | 2: gamla, fyra | 2b: gamla, fyra igen   | 3: nya, fyra |
| -------------------------------------------------------------------- | ----------------------- | -------------- | ---------------------- | ------------ |
| Rad 116, `expect(db.arenden).toHaveLength(2)`, kan aldrig misslyckas | 🟢                  | 🟢         | 🟢                 | 🟢       |
| Handlingen i specen görs inte: ingen otillåten kategori skickas      | 🟢                  | 🔴         | 🟢                 | 🟢       |
| `server.use` ersätter mockens kontroll av kategorin                  | 🟢                  | 🔴         | 🟢                 | 🟢       |
| R12: att prefixet "Value error, " tas bort prövas inte här           | 🟢                  | 🟢         | 🟡 | 🟢       |
| Utgångsläget kontrolleras inte före handlingen                       | 🔴                  | 🔴         | 🟢                 | 🟢       |
| Texter är kopierade från andra filer                                 | 🔴                  | 🔴         | 🟢                 | 🟢       |
| Rad 114 kräver inte specen                                           | 🟢                  | 🔴         | 🔴                 | 🔴       |
| **Antal av 7**                                                       | **5**                   | **2**          | **5**                  | **6**        |

🟢 hittad, 🔴 missad, 🟡 agenten bedömde att det prövas i ett annat test.

Körning 3 svarade dessutom på samma punkter för A2 och A3, och hittade att rad 60 i A2 nästan aldrig kan misslyckas.

| Kommando                         | Resultat | Datum      |
| -------------------------------- | -------- | ---------- |
| Körning 1: gamla skillen, A4     | 5 av 7   | 2026-11-05 |
| Körning 2: gamla skillen, A1–A4  | 2 av 7   | 2026-11-05 |
| Körning 2b: gamla skillen, A1–A4 | 5 av 7   | 2026-11-05 |
| Körning 3: nya skillen, A1–A4    | 6 av 7   | 2026-11-05 |

### Avvikelser och öppna frågor

- **En körning med den nya skillen.** AI svarar olika varje gång, så resultatet behöver upprepas för att vara säkert.
- **Checklistan bygger på fynd i just A4.** Den kan se bättre ut här än på andra tester. Nästa steg är att pröva den på ett annat test, till exempel A10.
- **Körning 3 körde testerna** (format, lint, typer och vitest), vilket de tidigare körningarna inte gjorde. Det var agentens eget val, inte en skillnad i instruktionen.
- **Fynden i A1–A4 är inte rättade.** Den viktigaste frågan till teamet: A4 kan inte prövas fullt ut i frontenden, eftersom användaren inte kan välja en otillåten kategori. Det kan behöva en Q# i specen, eller räcka med backendens API-test.
- **När passar arbetssättet?** Checklistan gör granskningen mer jämn, men längre. Den passar när ett test granskas mot specen. Den behövs inte för små ändringar som inte rör testernas logik.
