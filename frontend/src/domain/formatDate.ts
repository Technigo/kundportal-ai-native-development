// Ingen timeZone anges, så användarens lokala tidszon används
const listFormat = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const detailFormat = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// sv-SE skriver månaden som "okt.", designen utan punkt
function formatWithoutMonthDot(
  format: Intl.DateTimeFormat,
  isoTimestamp: string,
): string {
  return format
    .formatToParts(new Date(isoTimestamp))
    .map((part) =>
      part.type === 'month' ? part.value.replace(/\.$/, '') : part.value,
    )
    .join('')
}

// "31 okt 23:08"
export function formatListDate(isoTimestamp: string): string {
  return formatWithoutMonthDot(listFormat, isoTimestamp)
}

// "31 okt 2026 23:08"
export function formatDetailDate(isoTimestamp: string): string {
  return formatWithoutMonthDot(detailFormat, isoTimestamp)
}
