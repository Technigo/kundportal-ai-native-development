// Unicode code points, the same count as Python len() (CORE-14, B11).
// Not String.length, which counts UTF-16 code units, and not grapheme clusters.
export function codePointLength(text: string): number {
  return [...text].length
}
