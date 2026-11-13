import type { Arende } from "../types/arende";

// Made-up test data C1–C3 from docs/specs/sok-filter.md.
export function seedArenden(): Arende[] {
  return [
    {
      id: 1,
      rubrik: "Faktura saknas",
      beskrivning: "Kunden har inte fått sin faktura för oktober.",
      kategori: "Fakturering",
      prioritet: "Hög",
      status: "Nytt",
      skapad: "2026-10-20T08:00:00Z",
    },
    {
      id: 2,
      rubrik: "Kan inte logga in",
      beskrivning: "Inloggningen ger felmeddelande.",
      kategori: "Teknik",
      prioritet: "Medel",
      status: "Pågående",
      skapad: "2026-10-21T09:30:00Z",
    },
    {
      id: 3,
      rubrik: "Fel på faktura",
      beskrivning: "Fel belopp på fakturan.",
      kategori: "Fakturering",
      prioritet: "Låg",
      status: "Avslutat",
      skapad: "2026-10-22T14:15:00Z",
    },
  ];
}
