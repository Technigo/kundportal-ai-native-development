# UI-design och tillgänglighet

Gränssnittet följer det valda designförslaget: **Förslag 1, lista + detaljpanel, i Gröna Lund-tema** ([docs/design/forslag-1-gronalund.png](../../../../docs/design/forslag-1-gronalund.png)). Alla färgpar nedan är kontrollerade mot WCAG 2.1 AA (4,5:1 för text, 3:1 för kanter på kontroller). Ändra inte en färg utan att kontrollera kontrasten igen.

## Layout

- **Sidomeny** (220 px) till vänster: logotyp, "Kundservice", navigering. Krämvit bakgrund, tunn kant mot innehållet.
- **Toppfält**: sidrubrik till vänster, primärknappen "+ Registrera ärende" till höger.
- **Innehåll**: ärendelistan (cirka 60 %) och detaljpanelen (cirka 40 %) bredvid varandra. Under 1024 px visas de under varandra.
- Statusfiltret ligger överst i listkortet som chips: Alla, Nytt, Pågående, Väntar på kund, Avslutat, med antal.
- Detaljpanelen visar ID och kategori, rubrik, prioritet, skapad, beskrivning och statusväljare.

## Färgtokens: `frontend/src/styles/tokens.css`

```css
:root {
  /* Bas */
  --color-bg: #fdfaf2;            /* krämvit sidbakgrund och sidomeny */
  --color-surface: #ffffff;       /* kort och paneler */
  --color-surface-muted: #faf6ea; /* tabellhuvud, faktarutor */
  --color-border: #ece6d6;        /* dekorativa linjer */
  --color-border-control: #8c8676;/* kanter på chips, sökfält, statusväljare */

  /* Text */
  --color-text: #2e3038;
  --color-text-body: #3c3c3b;
  --color-text-muted: #5f6157;    /* ID, datum, tabellrubriker, Låg */

  /* Varumärke */
  --color-primary: #006649;       /* Gröna Lund-grön: primärknapp, aktivt filter, rubriker */
  --color-primary-hover: #004a35;
  --color-primary-soft: #dcf2ec;  /* aktivt menyval */
  --color-accent: #b8336a;        /* rosa: logotyp */
  --color-accent-soft: #fdeef3;   /* markerad rad i listan */
  --color-accent-line: #e06891;   /* markeringslinje, dekor */

  /* Prioritet */
  --color-priority-high: #c41f30;

  /* Status: text och kant / bakgrund */
  --color-status-new: #004390;               --color-status-new-bg: #e2ecf7;
  --color-status-in-progress: #8a4a00;       --color-status-in-progress-bg: #fdeccf;
  --color-status-waiting: #764f98;           --color-status-waiting-bg: #eee5f6;
  --color-status-closed: #006649;            --color-status-closed-bg: #dcf2ec;
  --color-status-selected-bg: #f39200;       /* vald status i statusväljaren, med mörk text */

  /* Form */
  --radius-pill: 999px;
  --radius-card: 16px;
  --radius-control: 10px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --font-family: "Segoe UI", system-ui, sans-serif;
}
```

Komponenternas CSS använder bara `var(--…)`. Behövs en ny färg läggs den till här, med kontrollerad kontrast.

## Komponentregler

| Komponent | Regel |
|---|---|
| Primärknapp | `--color-primary` bakgrund, vit text, pill-form. En per vy. |
| Statusetikett | Bakgrund `--color-status-*-bg`, text och 1 px kant i `--color-status-*`, pill-form, ingen radbrytning. |
| Statusväljare | Segmenterad kontroll med alla fyra statusar. Vald status: `--color-status-selected-bg`, **mörk** text (`--color-text`) och en bock ✓ före texten. Aldrig vit text på orange. |
| Filterchip | Kant `--color-border-control`. Aktivt: `--color-primary` bakgrund och vit text. |
| Markerad rad | `--color-accent-soft` bakgrund och 4 px vänsterlinje i `--color-accent-line`. |
| Hög prioritet | `--color-priority-high`, fetstil. Normal i `--color-text`, Låg i `--color-text-muted`. |
| Felmeddelande | Röd text under fältet och ⚠-ikon. Fältets kant blir röd. |

## Tillgänglighet

- **Färg är aldrig enda bäraren av information.** Status har alltid text, vald status har bock, markerad rad har en linje, fel har ikon och text.
- Semantiska element: `<button>` för knappar, `<table>` för ärendelistan, `<label>` för varje formulärfält, rubriknivåer i ordning.
- Statusfiltret är en grupp knappar med `aria-pressed`. Statusväljaren är en `radiogroup` med `aria-label="Ändra status"`.
- Allt går att använda med tangentbord. Synlig fokusmarkering: `outline: 3px solid var(--color-primary); outline-offset: 2px`. Ta aldrig bort `outline` utan ersättning.
- Fel och bekräftelser meddelas skärmläsare: `role="alert"` för fel, `role="status"` för "Ärendet har sparats".
- Ikoner som bara är dekor får `aria-hidden="true"`.

## UI-texter

- Svenska, kort och vänligt. Säg vad som hänt och vad användaren kan göra: "Ändringen kunde inte sparas. Försök igen."
- Knappar beskriver handlingen med verb: "Registrera ärende", "Spara ärende", "Avbryt".
- Sentence case: "Väntar på kund", inte "Väntar På Kund".
- Datum: `27 okt 09:14` i listan, `27 okt 2026, 09:14` i detaljvyn.
- Ärende-ID visas med `#` framför: `#1042`.
