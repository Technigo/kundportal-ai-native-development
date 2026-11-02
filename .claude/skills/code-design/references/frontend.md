# Frontend: React + TypeScript

React 19, TypeScript och Vite. Strikt TypeScript. `npm run build` kör typkontrollen (`tsc -b`). Ingen formatterare och inget lint-skript är valt än. Följ stilen i befintlig kod: **inga semikolon, enkla citattecken, 2 blanksteg, avslutande kommatecken** i flerradiga listor.

## Namngivning

| Vad | Stil | Exempel |
|---|---|---|
| Komponent och komponentfil | `PascalCase` | `TicketList.tsx`, `StatusBadge.tsx` |
| Hook | `useCamelCase` | `useTickets.ts`, `useUpdateStatus.ts` |
| Övriga filer | `camelCase` | `tickets.ts`, `formatDate.ts` |
| Variabler och funktioner | `camelCase` | `selectedTicketId`, `formatCreatedAt` |
| Typer | `PascalCase`, inget `I`-prefix | `Ticket`, `TicketStatus` |
| Konstanter | `UPPER_SNAKE_CASE` | `TITLE_MAX_LENGTH` |
| CSS-klasser (CSS Modules) | `camelCase` | `styles.statusBadge` |
| Testfil | samma namn + `.test.ts(x)` bredvid filen | `TicketForm.test.tsx` |

Fält från API:t behåller `snake_case` (`created_at`) i typerna – ingen automatisk omvandling. Det gör att typerna matchar kontraktet exakt.

## Domänfilen `src/domain/ticket.ts`

Här, och bara här, finns maskinvärden, typer, svenska visningsnamn och längdgränser. Värdena ska stämma exakt med [API-kontraktet](../../../../docs/api-kontrakt.md):

```ts
export const CATEGORIES = ['billing', 'technical_support', 'other'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  billing: 'Faktura',
  technical_support: 'Teknisk support',
  other: 'Övrigt',
}

export const TEXT_LIMITS = {
  customer_id: 100,
  customer_name: 200,
  title: 100,
  description: 5000,
} as const
```

Samma mönster för `PRIORITIES`/`PRIORITY_LABELS` och `STATUSES`/`STATUS_LABELS`. Skriv aldrig `'Pågående'` eller `'in_progress'` som lös sträng i en komponent – importera härifrån.

`src/domain/text.ts` har `WHITE_SPACE` (exakt samma tecken som `WHITE_SPACE` i `backend/app/schemas.py`), `trimText` och `textLength` (`[...trimText(value)].length`). Använd aldrig `.trim()` eller `value.length` för fältvalidering.

`src/domain/fieldErrors.ts` har de fältspecifika svenska felmeddelandena (K2), t.ex. "Ange kund-ID", "Ange en rubrik", "Rubriken får innehålla högst 100 tecken".

## Komponenter

- Bara funktionskomponenter och hooks. Inga klasskomponenter.
- Props-typ heter `<Komponent>Props` och deklareras ovanför komponenten.
- Namngivna exporter (`export function TicketList`), inga default-exporter. Undantag: `App.tsx`, som redan har en default-export.
- En komponent per fil. Hjälpkomponenter som bara används i filen får ligga kvar i den.
- Komponenter i `components/` vet ingenting om ärenden. Det som kan ärenden ligger i `features/tickets/`.

```tsx
type StatusBadgeProps = {
  status: TicketStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={styles[status]}>{STATUS_LABELS[status]}</span>
}
```

## State och datahämtning

- Inget globalt state-bibliotek. `useState`, `useReducer` och egna hooks räcker.
- Datahämtning sker i hooks i `features/tickets/` som anropar `src/api/`. Varje hook exponerar `data`, `error` och `isLoading` (eller `isSaving`).
- **Statusfiltret (K8)** ligger i React-state högt upp i trädet, så att det finns kvar när användaren öppnar ett ärende och går tillbaka till listan. Det sparas **inte** i URL:en, `localStorage` eller `sessionStorage` – efter en fullständig omladdning ska det återgå till Alla.
- **Ingen optimistisk uppdatering** (K6, K7). Efter lyckat `POST`/`PATCH`: uppdatera med ärendet backend returnerade och hämta listan på nytt med det valda filtret. Ett ärende som bytt status från Nytt till Pågående ska alltså försvinna ur listan när filtret Nytt är valt. Efter fel: behåll tidigare data och visa felet.
- Det finns ingen redigering eller radering av ärenden. Bygg inga knappar eller formulär för det.

## API-klienten `src/api/`

- All `fetch` sker i `src/api/client.ts`. Bas-URL från `import.meta.env.VITE_API_BASE_URL` med `http://localhost:8000` som standard, som i `App.tsx`.
- Funktioner per resurs i `src/api/tickets.ts`: `listTickets`, `getTicket`, `createTicket`, `updateTicketStatus`. Svarstyper följer API-kontraktet exakt. Listan är en vanlig array.
- Klienten kastar ett `ApiError` med `status`, `code`, `message` och `fields`, enligt kontraktets felformat. `fields` är `Record<string, string[]>` – en lista med texter per fält.
- Nätverksfel (inget svar alls) blir `ApiError` med `code: 'network_error'`. Om det var en skrivning är utfallet okänt och ska hanteras som `save_outcome_unknown`.

Så hanteras felkoderna i gränssnittet:

| `code` | Visa | Formulär |
|---|---|---|
| `validation_error` | Fält-fel vid respektive fält | Behåll inmatningen |
| `not_found` | "Ärendet kunde inte hittas" + väg tillbaka till listan | – |
| `storage_unavailable` | "Ändringen kunde inte sparas. Försök igen." | Behåll inmatningen |
| `save_outcome_unknown`, eller `network_error` vid skrivning | "Det gick inte att bekräfta att ändringen sparades. Uppdatera listan och kontrollera innan du försöker igen." | Behåll inmatningen. **Skicka inte om automatiskt.** |

## Formulär (K1, K2)

- Fält i ordning: Kund-ID, Kundnamn, Rubrik, Beskrivning, Kategori, Prioritet. Alla är obligatoriska.
- Kontrollerade fält (`value` + `onChange`).
- Validera med samma regler som backend när användaren skickar, och visa de fältspecifika texterna från `fieldErrors.ts` vid fältet.
- Backendens svar har alltid sista ordet. Fält-fel från en `422` som frontend inte redan fångat visas vid rätt fält: frontendens egen text för fältet om den finns, annars backendens text.
- Efter lyckad registrering öppnas det nya ärendets detaljvy. Rensa formuläret bara efter lyckat svar – vid fel finns inmatningen kvar.
- Skicka-knappen är inaktiverad medan anropet pågår, så att samma ärende inte skapas två gånger.
- Visa teckenräknare för textfälten med `textLength` och `TEXT_LIMITS`.

## Felvisning och tomlägen

| Situation | Visa |
|---|---|
| Fält-fel | Text under fältet, fältet markerat, `aria-invalid` och `aria-describedby` |
| Fel för hela formuläret eller en åtgärd | `Alert` ovanför formuläret eller i detaljpanelen, `role="alert"` |
| Inga ärenden (K4) | "Det finns inga ärenden ännu" |
| Inga träffar för filtret (K8) | "Inga ärenden matchar vald status" |
| Okänt ärende (K5) | "Ärendet kunde inte hittas" + länk tillbaka till listan |
| Laddar | Kort text eller skelett, aldrig en tom yta |

## Datum och tid

Formatera `created_at` på ett ställe, `src/domain/formatDate.ts`, med `Intl.DateTimeFormat('sv-SE', …)` utan `timeZone`, så att användarens lokala tidszon används. Tolka aldrig tidssträngar för hand.

API:t skickar sex decimaler (`2026-10-31T22:08:34.123456Z`). JavaScripts datumformat specificerar bara tre, så `formatDate` ska ha ett test med en riktig tidssträng från kontraktet som visar att den tolkas rätt.

## Styling

- CSS Modules (`Komponent.module.css`) bredvid komponenten. Inga inline-stilar utom för helt dynamiska värden.
- Använd bara färger, avstånd och radier från `src/styles/tokens.css` via `var(--…)`. Inga hexkoder i komponenternas CSS. Se [ui-design.md](ui-design.md).
