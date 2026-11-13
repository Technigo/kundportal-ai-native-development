import type { ErrorResponse } from "@/api/types"

// Shown when the browser cannot reach the backend at all, or the answer has no readable
// detail. KSP-38 (error messages in the UI) owns the wording: written for a case worker,
// without technical words (HIST-14 and CORE-16, errors in Swedish without technical
// details), and says what to do. The list and the ticket client share this text.
export const BACKEND_UNREACHABLE =
  "Kundserviceportalen svarar inte just nu. Försök igen om en stund."

// The same text as the backend's own 500 answer (UNEXPECTED_ERROR in backend/app/errors.py).
export const UNEXPECTED_ERROR = "Något gick fel. Försök igen."

// The message for an error answer without a readable detail. Only the gateway codes mean that
// the backend could not be reached: the dev proxy answers 502 when the backend is down, and
// 503 and 504 come from a proxy in the same way. Any other code came from the backend, so it
// gets the general message. Otherwise a 404 without detail would say "svarar inte" next to
// the link back to the list (Mustafa's finding 3 in the review of PR #107).
export function messageWithoutDetail(status: number): string {
  return status === 502 || status === 503 || status === 504 ? BACKEND_UNREACHABLE : UNEXPECTED_ERROR
}

// The detail of an error answer, or null when the answer has none: not JSON, or JSON without
// a detail string. The ticket client and the ticket list both read errors with it.
export async function errorDetail(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as Partial<ErrorResponse> | null
    return typeof body?.detail === "string" && body.detail !== "" ? body.detail : null
  } catch {
    return null
  }
}
