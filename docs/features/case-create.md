# CASE-CREATE — Skapa ärende

## Leverans

En handläggare kan registrera ett ärende i UI:t. Frontend, API och SQLite validerar och sparar uppgifterna. Fel visas begripligt utan att ett ogiltigt ärende skapas.

## Fältregler

- Rubrik: krävs efter trimning; 1–120 tecken.
- Beskrivning: krävs efter trimning; 1–2 000 tecken.
- Kategori: krävs och väljs i rullista; `Konto`, `Fakturering`, `Tekniskt` eller `Övrigt`.
- Prioritet: krävs och väljs i rullista; `Låg`, `Normal` eller `Hög`.
- Status sätts till `Nytt`; skapandetid sätts av systemet.
- Intern anteckning krävs inte vid skapande; se [CASE-NOTE](./case-note.md).

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-CREATE-001 | Giltig rubrik sparas trimmad. Saknad, tom eller blank rubrik avvisas. Längd 120 godtas; 121 avvisas. | `CaseForm.test.tsx`: kräver rubrik, begränsar längden och skickar trimmade textvärden. `cases.test.ts`: validerar rubrik. |
| CASE-CREATE-002 | Giltig beskrivning sparas trimmad. Saknad, tom eller blank beskrivning avvisas. Längd 2 000 godtas; 2 001 avvisas. | `CaseForm.test.tsx`: kräver beskrivning, begränsar längden och skickar trimmade textvärden. `cases.test.ts`: validerar beskrivning. |
| CASE-CREATE-003 | Kategori krävs och väljs i en rullista som bara visar de fyra tillåtna kategorierna. API:t avvisar okänd kategori. | `CaseForm.test.tsx`: kräver kategori och visar tillåtna alternativ. `cases.test.ts`: validerar kategori. |
| CASE-CREATE-004 | Prioritet krävs och väljs i en rullista som bara visar de tre tillåtna prioriteterna. API:t avvisar okänd prioritet. | `CaseForm.test.tsx`: kräver prioritet och visar tillåtna alternativ. `cases.test.ts`: validerar prioritet. |
| CASE-CREATE-005 | Giltigt ärende får status `Nytt` och systemgenererad skapandetid. | `[CASE-CREATE-005]` standardstatus och skapandetid |
| CASE-CREATE-006 | Sparat ärende finns kvar och kan läsas efter ny databasanslutning. | `[CASE-CREATE-006]` beständig lagring efter ny anslutning |
| CASE-CREATE-007 | Ett ogiltigt anrop ger begripligt valideringsfel och skapar inget ärende. | `CaseForm.test.tsx`: visar begripligt API-valideringsfel. `cases.test.ts`: avvisar ogiltig indata utan att spara. |
| CASE-CREATE-008 | Ärende kan skapas utan anteckning. | `CaseForm.test.tsx` och `cases.test.ts`: skapar ärende utan intern anteckning. |

## Testfiler

- API, validering och SQLite: [cases.test.ts](../../packages/api/src/cases.test.ts)
- Formulär, rullistor och felbesked: [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx)
- Kör båda testsviterna med `npm test`.

## Definition av färdig

- UI, API och beständig lagring fungerar tillsammans.
- Alla krav-ID:n täcks av tester som passerar.
- Valideringsfel visas på svenska; felaktiga anrop ändrar inte lagringen.
- Test-ID:n finns i testnamn eller beskrivningar och README beskriver vid behov nya körkommandon.
