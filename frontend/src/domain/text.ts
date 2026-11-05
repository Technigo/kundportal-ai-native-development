// Samma tecken som WHITE_SPACE i backend/app/schemas.py (Unicode White_Space).
// Använd aldrig .trim() eller value.length för fältvalidering.
export const WHITE_SPACE = new Set([
  '\u0009',
  '\u000a',
  '\u000b',
  '\u000c',
  '\u000d',
  ' ',
  '\u0085',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  '　',
])

// Gränser enligt API-kontraktet, räknade i Unicode-kodpunkter efter trimning
export const TEXT_LIMITS = {
  customer_id: 100,
  customer_name: 200,
  title: 100,
  description: 5000,
} as const

export type TextField = keyof typeof TEXT_LIMITS

// Tar bara bort blanksteg i början och slutet, inre blanksteg bevaras
export function trimText(value: string): string {
  let start = 0
  let end = value.length
  while (start < end && WHITE_SPACE.has(value[start])) start += 1
  while (end > start && WHITE_SPACE.has(value[end - 1])) end -= 1
  return value.slice(start, end)
}

export function textLength(value: string): number {
  return [...trimText(value)].length
}
