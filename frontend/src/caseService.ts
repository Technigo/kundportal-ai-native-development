import type { CaseStatus } from "./caseOptions";

export type CreateCaseInput = {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: CaseStatus;
  customer_email: string;
};

export type CaseRecord = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  priority: string | null;
  status: CaseStatus;
  customer_email: string;
  created_at: string;
  updated_at: string;
};

export type CreatedCase = CaseRecord;

export class CaseApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaseApiError";
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new CaseApiError(
      "Could not reach the server. Check that the backend is running and try again.",
    );
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new CaseApiError(getApiErrorMessage(response.status, result));
  }
  return result as T;
}

export async function getCases(): Promise<CaseRecord[]> {
  const result = await requestJson<unknown>("/cases/?skip=0&limit=100");
  if (!Array.isArray(result)) {
    throw new CaseApiError(
      "The server returned an unexpected case list. Please try again.",
    );
  }
  return result as CaseRecord[];
}

export function createCase(input: CreateCaseInput): Promise<CreatedCase> {
  return requestJson<CreatedCase>("/cases/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

function getApiErrorMessage(status: number, result: unknown): string {
  if (status === 422 && isRecord(result) && Array.isArray(result.detail)) {
    const messages = result.detail
      .map((issue) =>
        isRecord(issue) && typeof issue.msg === "string" ? issue.msg : null,
      )
      .filter((message): message is string => message !== null);
    if (messages.length > 0)
      return `Please review the case information: ${messages.join(" ")}`;
  }
  if (status >= 500)
    return "The server could not complete this request. Please try again.";
  return "The request could not be completed. Please try again.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
