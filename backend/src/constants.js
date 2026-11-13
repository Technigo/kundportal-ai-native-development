// Gemensamma regler från SPECIFIKATION.md (avsnitt "Datamodell" och "Statusar").
// Ändra här – inte i flera filer – om en regel ändras i specen.

export const KATEGORIER = [
  'Anmälan och inskrivning',
  'Aktivitetsrapport',
  'Ersättning och stöd',
  'Jobb och sökning',
  'Utbildning och insatser',
  'Digital tjänst och inloggning',
  'Övrigt',
];

export const STATUSAR = ['Nytt', 'Pågående', 'Väntar på kund', 'Avslutat'];

export const PRIORITET_MIN = 1;
export const PRIORITET_MAX = 5;

export const RUBRIK_MAX = 100;
export const BESKRIVNING_MAX = 5000;
