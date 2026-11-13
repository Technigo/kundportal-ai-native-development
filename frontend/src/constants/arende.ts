import type { ArendeStatus } from "../types/arende";

// Matches ArendeStatus in backend/app/schemas/arende.py.
export const STATUSAR: readonly ArendeStatus[] = ["Nytt", "Pågående", "Väntar på kund", "Avslutat"];

// Allowed values from docs/specs/kravspec.md (Q1, Q2), in the spec's order. Same as
// TILLATNA_KATEGORIER and TILLATNA_PRIORITETER in backend/app/schemas/arende.py.
export const KATEGORIER: readonly string[] = ["Fakturering", "Teknik", "Leverans", "Övrigt"];
export const PRIORITETER: readonly string[] = ["Låg", "Medel", "Hög"];
