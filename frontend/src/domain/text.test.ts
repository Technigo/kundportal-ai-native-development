import { expect, it } from 'vitest'
import { TEXT_LIMITS, textLength, trimText } from './text'

// Samma fall ska finnas i backendens tester (tester.md)
const TRIM_CASES: [string, string, string][] = [
  ['vanliga blanksteg', '  Fråga  ', 'Fråga'],
  ['tabbar', '\tFråga\t', 'Fråga'],
  ['radbrytningar', '\r\nFråga\n', 'Fråga'],
  ['U+00A0', ' Fråga ', 'Fråga'],
  ['U+3000', '　Fråga　', 'Fråga'],
  ['inre blanksteg bevaras', ' a  b\nc ', 'a  b\nc'],
  ['enbart blanksteg', ' \t\n  ', ''],
  ['U+200B är inget blanksteg', '​Fråga', '​Fråga'],
]

it.each(TRIM_CASES)('trimText: %s', (_name, input, expected) => {
  expect(trimText(input)).toBe(expected)
})

const LENGTH_CASES: [string, string, number][] = [
  ['tom text', '', 0],
  ['enbart blanksteg', '   ', 0],
  ['ett tecken', ' a ', 1],
  ['emoji är en kodpunkt', '😀', 1],
  ['sammansatt emoji räknas i kodpunkter', '👨‍👩‍👧', 5],
]

it.each(LENGTH_CASES)('textLength: %s', (_name, input, expected) => {
  expect(textLength(input)).toBe(expected)
})

const LIMIT_CASES = Object.entries(TEXT_LIMITS).flatMap(([field, max]) => [
  [field, 1, 1],
  [field, max, max],
  [field, max + 1, max + 1],
])

it.each(LIMIT_CASES)('%s: %i tecken ger längd %i', (_field, count, expected) => {
  expect(textLength(` ${'a'.repeat(count as number)} `)).toBe(expected)
})
