import { expect, it } from 'vitest'
import { formatListDate } from './formatDate'

it('formats a contract timestamp with six decimals in local time', () => {
  // Tidsformatet i API-kontraktet: UTC, Z och sex decimaler
  const timestamp = '2026-10-15T12:08:34.123456Z'
  const local = new Date('2026-10-15T12:08:34.123Z')
  const hours = String(local.getHours()).padStart(2, '0')

  expect(formatListDate(timestamp)).toBe(`${local.getDate()} okt ${hours}:08`)
})
