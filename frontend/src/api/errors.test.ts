import { describe, expect, it } from "vitest"

import { BACKEND_UNREACHABLE } from "@/api/errors"
import { expectNoTechnicalWords, technicalWordsIn } from "@/test/technical-words"

// Every message in the backend catalogue (backend/app/errors.py), so the check is tried on
// all real texts, not a few examples. Mustafa's review of PR #107 found that "Välj en giltig
// status." was flagged before.
const BACKEND_MESSAGES = [
  "Rubrik måste fyllas i.",
  "Rubriken får vara högst 100 tecken.",
  "Beskrivning måste fyllas i.",
  "Beskrivningen får vara högst 2000 tecken.",
  "Välj en giltig kategori.",
  "Välj en giltig prioritet.",
  "Status sätts automatiskt och kan inte anges när ett ärende skapas.",
  "Välj en giltig status.",
  "Ärendet har redan den statusen.",
  "Statusen kunde inte ändras. Försök igen.",
  "Ogiltig indata.",
  "Ärendet finns inte.",
  "Sidan finns inte.",
  "Metoden stöds inte.",
  "Något gick fel. Försök igen.",
]

describe("Shared error messages", () => {
  // HIST-14 and CORE-16 (errors in Swedish without technical details, KSP-38): the text
  // shown when the backend cannot be reached.
  it("the shared network message has no technical words", () => {
    expectNoTechnicalWords(BACKEND_UNREACHABLE)
  })

  // The check itself must let every Swedish text through, including words that start with
  // a field name ("statusändring") ...
  it("the check lets every backend message and Swedish compound through", () => {
    for (const text of [
      ...BACKEND_MESSAGES,
      BACKEND_UNREACHABLE,
      "Ingen statusändring gjordes.",
      "Ärende #412 finns inte.",
    ]) {
      expect(technicalWordsIn(text), text).toEqual([])
    }
  })

  // ... and still catch technical text: the old network message, a field name as in JSON or
  // code, and a status code added to a message.
  it("the check still finds technical text", () => {
    expect(technicalWordsIn("Kunde inte nå backenden. Starta den på port 8010 (se README).")).toHaveLength(3)
    expect(technicalWordsIn('{"status": 5}')).not.toEqual([])
    expect(technicalWordsIn("status: invalid")).not.toEqual([])
    expect(technicalWordsIn("Statusen kunde inte ändras. Försök igen. (503)")).not.toEqual([])
    expect(technicalWordsIn("TypeError: Failed to fetch")).not.toEqual([])
  })
})
