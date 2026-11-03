import type { CaseStatus } from "./caseOptions";

export type CreateCaseInput = {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: CaseStatus;
  customer_email: string;
};

export type CreatedCase = CreateCaseInput & {
  id: string;
  created_at: string;
  updated_at: string;
};

export class CaseApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaseApiError";
  }
}

export async function createCase(input: CreateCaseInput): Promise<CreatedCase> {
  let response: Response;
  try {
    response = await fetch("/cases/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new CaseApiError("Could not reach the server. Check that the backend is running and try again.");
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new CaseApiError(getApiErrorMessage(response.status, result));
  }
  return result as CreatedCase;
}

function getApiErrorMessage(status: number, result: unknown): string {
  if (status === 422 && isRecord(result) && Array.isArray(result.detail)) {
    const messages = result.detail
      .map((issue) => isRecord(issue) && typeof issue.msg === "string" ? issue.msg : null)
      .filter((message): message is string => message !== null);
    if (messages.length > 0) return `Please review the case information: ${messages.join(" ")}`;
  }
  if (status >= 500) return "The server could not save this case. Please try again.";
  return "The case could not be saved. Please check the information and try again.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
