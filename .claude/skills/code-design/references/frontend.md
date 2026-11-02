# Frontend: React + TypeScript

Byggs med Vite. Strikt TypeScript (`"strict": true`). Lint med ESLint, formatering med Prettier (standardinställningar, semikolon, enkla citattecken, 2 blanksteg).

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

Här, och bara här, finns tillåtna värden, typer, svenska visningsnamn och klientvalidering:

```ts
export const CATEGORIES = ['invoice', 'technical_support', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  invoice: 'Faktura',
  technical_support: 'Teknisk support',
  other: 'Övrigt',
};

export const TITLE_MAX_LENGTH = 100;

// Längd i Unicode-kodpunkter efter trimning, samma som backend.
export const textLength = (value: string): number => [...trimText(value)].length;
```

`trimText` ligger i `src/domain/text.ts` och tar bort exakt samma tecken som backendens `trim_text` (se [arkitektur.md](arkitektur.md#fältregler)). Använd aldrig `.trim()` direkt för fältvalidering.

Samma mönster för `PRIORITIES`/`PRIORITY_LABELS` och `STATUSES`/`STATUS_LABELS`. Skriv aldrig `'Pågående'` eller `'in_progress'` som lös sträng i en komponent – importera härifrån.

## Komponenter

- Bara funktionskomponenter och hooks. Inga klasskomponenter.
- Props-typ heter `<Komponent>Props` och deklareras ovanför komponenten.
- Namngivna exporter (`export function TicketList`), inga default-exporter.
- En komponent per fil. Hjälpkomponenter som bara används i filen får ligga kvar i den.
- Komponenter i `components/` vet ingenting om ärenden. Det som kan ärenden ligger i `features/tickets/`.

```tsx
type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={styles[status]}>{STATUS_LABELS[status]}</span>;
}
```

## State och datahämtning

- Inget globalt state-bibliotek. `useState`, `useReducer` och egna hooks räcker.
- Datahämtning sker i hooks i `features/tickets/` som anropar `src/api/`. Varje hook exponerar `data`, `error` och `isLoading` (eller `isSaving`).
- **Statusfiltret (K8)** ligger i React-state högt upp i trädet, så att det finns kvar när användaren öppnar ett ärende och går tillbaka till listan. Det sparas **inte** i URL:en, `localStorage` eller `sessionStorage` – efter en fullständig omladdning ska det återgå till Alla.
- **Ingen optimistisk uppdatering** (K6, K7). Efter lyckat `POST`/`PATCH`: uppdatera med ärendet backend returnerade och hämta listan på nytt med det valda filtret. Ett ärende som bytt status från Nytt till Pågående ska alltså försvinna ur listan när filtret Nytt är valt. Efter fel: behåll tidigare data och visa felet.
- Det finns ingen redigering eller radering av ärenden. Bygg inga knappar eller formulär för det.

## API-klienten `src/api/`

- All `fetch` sker i `src/api/client.ts`. Funktioner per resurs i `src/api/tickets.ts`: `listTickets`, `getTicket`, `createTicket`, `updateTicketStatus`.
- Klienten kastar ett `ApiError` med `status`, `code`, `message` och `fields` från felformatet i arkitekturen. Nätverksfel (ingen kontakt med servern) blir `ApiError` med `code: 'network_error'` och meddelandet "Kunde inte nå servern. Försök igen."
- Komponenter fångar `ApiError` och visar `message`, och `fields[fältnamn]` vid rätt fält.

## Formulär (K1, K2)

- Fält i ordning: Kund-ID, Kundnamn, Rubrik, Beskrivning, Kategori, Prioritet. Alla är obligatoriska.
- Kontrollerade fält (`value` + `onChange`).
- Validera med samma regler som backend när användaren skickar, och visa felet vid fältet. Backendens svar har alltid sista ordet: fält-fel från en `422` visas på samma sätt.
- Rensa formuläret bara efter lyckat svar. Vid fel finns inmatningen kvar.
- Skicka-knappen är inaktiverad medan anropet pågår, så att samma ärende inte skapas två gånger.
- Visa teckenräknare för rubrik och beskrivning med `textLength`.

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

## Styling

- CSS Modules (`Komponent.module.css`) bredvid komponenten. Inga inline-stilar utom för helt dynamiska värden.
- Använd bara färger, avstånd och radier från `src/styles/tokens.css` via `var(--…)`. Inga hexkoder i komponenternas CSS. Se [ui-design.md](ui-design.md).
