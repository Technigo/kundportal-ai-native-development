import { expect } from "vitest"

// HIST-14 and CORE-16 (errors in Swedish, never stack traces, SQL or English field names),
// checked in the UI by KSP-38 (error messages in the UI): a message a case worker can see
// has no technical words.
//
// JavaScript's \b only knows ASCII letters, so a Swedish word such as "statusändring" or the
// sentence "Välj en giltig status." would match a plain \bstatus\b. Field names therefore
// count only as they look in JSON or code ("status" or status:), in lower case.
// Status codes count only as 4xx and 5xx, not after "#" (a ticket number such as #412) and
// not inside longer numbers (so "högst 2000 tecken" is fine). Use the check on the error
// message itself, not the whole page, where ticket ids can look like status codes.
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
  /"(title|description|category|priority|status)"|\b(title|description|category|priority|status)\s*:/,
  /(?<![#\d])\b[45]\d\d\b/,
]

export function technicalWordsIn(text: string): string[] {
  return TECHNICAL_WORDS.filter((word) => word.test(text)).map(String)
}

export function expectNoTechnicalWords(element: Element | string) {
  const text = typeof element === "string" ? element : (element.textContent ?? "")
  expect(technicalWordsIn(text), `technical words in: ${text}`).toEqual([])
}
