import type { FieldErrors } from "../types/arende";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const NETWORK_ERROR_MESSAGE = "Kunde inte nå servern. Försök igen.";
export const VALIDATION_ERROR_MESSAGE = "Kontrollera fälten och försök igen.";
export const UNKNOWN_ERROR_MESSAGE = "Något gick fel. Försök igen.";

interface ValidationDetail {
  loc?: (string | number)[];
  msg?: string;
}

// FastAPI returns `detail` as a string (HTTPException) or a list (422 validation).
export function toApiError(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail;

  if (Array.isArray(detail)) {
    const fieldErrors: FieldErrors = {};
    for (const item of detail as ValidationDetail[]) {
      const field = item.loc?.[item.loc.length - 1];
      if (typeof field === "string" && item.msg && !(field in fieldErrors)) {
        fieldErrors[field as keyof FieldErrors] = stripPydanticPrefix(item.msg);
      }
    }
    return new ApiError(VALIDATION_ERROR_MESSAGE, status, fieldErrors);
  }

  if (typeof detail === "string" && detail) {
    return new ApiError(detail, status);
  }

  return new ApiError(UNKNOWN_ERROR_MESSAGE, status);
}

// Pydantic prefixes custom validator messages with "Value error, ". The backend's error
// handler (backend/app/fel.py) removes it; this removes it too, so no technical text is
// shown (R12).
function stripPydanticPrefix(message: string): string {
  return message.replace(/^Value error,\s*/, "");
}
