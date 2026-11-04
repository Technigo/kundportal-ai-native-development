// Ingen timeZone anges, så användarens lokala tidszon används
const listFormat = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

// "31 okt 23:08" – sv-SE skriver månaden som "okt.", designen utan punkt
export function formatListDate(isoTimestamp: string): string {
  return listFormat
    .formatToParts(new Date(isoTimestamp))
    .map((part) =>
      part.type === 'month' ? part.value.replace(/\.$/, '') : part.value,
    )
    .join('')
}
