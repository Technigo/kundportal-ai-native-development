// Swedish standard format, YYYY-MM-DD HH:MM (same as the detail view, KSP-31).
const dateTimeFormat = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

// The API sends UTC with microseconds (YYYY-MM-DDTHH:MM:SS.ffffffZ). JavaScript only
// guarantees parsing of milliseconds, so the extra digits are cut before parsing.
export function parseApiTime(value: string): Date {
  return new Date(value.replace(/(\.\d{3})\d+Z$/, "$1Z"))
}

// Shown in the user's local time zone (api-konventioner.md section 3).
export function formatLocalDateTime(value: string): string {
  return dateTimeFormat.format(parseApiTime(value))
}
