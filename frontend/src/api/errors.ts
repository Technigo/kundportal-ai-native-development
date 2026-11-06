import type { ErrorResponse } from "@/api/types"

// Shown when the browser cannot reach the backend at all, or the answer has no readable
// detail. KSP-38 (error messages in the UI) owns the wording: written for a case worker,
// without technical words (HIST-14 and CORE-16, errors in Swedish without technical
// details), and says what to do. The list and the ticket client share this text.
export const BACKEND_UNREACHABLE =
  "Kundserviceportalen svarar inte just nu. Försök igen om en stund."

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
