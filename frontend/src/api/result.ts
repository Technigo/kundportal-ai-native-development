import { BACKEND_UNREACHABLE, errorDetail, messageWithoutDetail } from "@/api/errors"

// The answer to one API call: the data, or an error with the text to show. httpStatus is
// missing only when no answer came at all (fetch failed). An answer without a readable
// detail, such as a 502 from the dev proxy when the backend is down, has httpStatus.
export type Result<T> =
  | { state: "ok"; data: T }
  | { state: "error"; message: string; httpStatus?: number }

// The one place that turns an API call into a Result (KSP-79: error handling for API calls
// in one place). Errors are {"detail": "<Swedish message>"} (api-konventioner.md section 2),
// and the detail is shown as it is (KSP-38 AC1, the detail from the API unchanged).
export async function toResult<T>(request: Promise<Response>): Promise<Result<T>> {
  try {
    const response = await request
    if (response.ok) {
      return { state: "ok", data: (await response.json()) as T }
    }
    // KSP-38 AC2: no readable detail gives a fixed Swedish text, never an empty alert.
    // The status code decides which text (messageWithoutDetail).
    const detail = await errorDetail(response)
    return {
      state: "error",
      message: detail ?? messageWithoutDetail(response.status),
      httpStatus: response.status,
    }
  } catch {
    // KSP-38 AC2: no answer at all, or an answer that cannot be read, gives the Swedish
    // text and never the browser's error (HIST-14, errors without technical details).
    return { state: "error", message: BACKEND_UNREACHABLE }
  }
}
