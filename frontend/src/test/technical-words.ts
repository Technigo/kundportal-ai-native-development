import { expect } from "vitest"

// K1 point 1 in the error message spec (KSP-38, HIST-14, CORE-16): a message a case worker
// can see has no technical words. Word boundaries keep Swedish words such as "statusen" and
// "Kundserviceportalen" from matching. Only 4xx and 5xx codes count, so "högst 100 tecken"
// is fine.
export const TECHNICAL_WORDS: RegExp[] = [
  /\bbackend/i,
  /\bport\b/i,
  /\bREADME\b/i,
  /\bJSON\b/i,
  /\bfetch\b/i,
  /\bTypeError\b/,
  /\bSyntaxError\b/,
  /\bSQL\b/i,
  /\bTraceback\b/i,
  /\b(title|description|category|priority|status)\b/,
  /\b[45]\d\d\b/,
]

export function technicalWordsIn(text: string): string[] {
  return TECHNICAL_WORDS.filter((word) => word.test(text)).map(String)
}

export function expectNoTechnicalWords(element: Element | string) {
  const text = typeof element === "string" ? element : (element.textContent ?? "")
  expect(technicalWordsIn(text), `technical words in: ${text}`).toEqual([])
}
