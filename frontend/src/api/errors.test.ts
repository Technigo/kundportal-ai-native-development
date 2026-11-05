import { describe, expect, it } from "vitest"

import { BACKEND_UNREACHABLE } from "@/api/errors"
import { expectNoTechnicalWords, technicalWordsIn } from "@/test/technical-words"

describe("Shared error messages", () => {
  // K1 point 1 (KSP-38): the text shown when nothing readable comes back (R3).
  it("K1: the shared network message has no technical words", () => {
    expectNoTechnicalWords(BACKEND_UNREACHABLE)
  })

  // The check itself: the old text must be caught, and Swedish texts from the API must not.
  it("K1: the check finds the old text and lets the API texts through", () => {
    expect(technicalWordsIn("Kunde inte nå backenden. Starta den på port 8010 (se README).")).toHaveLength(3)
    for (const text of [
      "Ärendet har redan den statusen.",
      "Statusen kunde inte ändras. Försök igen.",
      "Rubriken får vara högst 100 tecken.",
      "Beskrivningen får vara högst 2000 tecken.",
      "Kundserviceportalen svarar inte just nu. Försök igen om en stund.",
    ]) {
      expect(technicalWordsIn(text), text).toEqual([])
    }
  })
})
