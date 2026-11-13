export type ArendeStatus = "Nytt" | "Pågående" | "Väntar på kund" | "Avslutat";

export interface Arende {
  id: number;
  rubrik: string;
  beskrivning: string;
  kategori: string;
  prioritet: string;
  status: ArendeStatus;
  skapad: string;
}

export interface ArendeCreate {
  rubrik: string;
  beskrivning: string;
  kategori: string;
  prioritet: string;
}

export interface ArendeFilter {
  q?: string;
  status?: string;
  kategori?: string;
  prioritet?: string;
}

export type FieldErrors = Partial<Record<keyof ArendeCreate | "status", string>>;
