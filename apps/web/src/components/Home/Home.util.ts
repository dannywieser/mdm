/**
 * Returns a column count that keeps the grid compact and balanced:
 * - 1–3 items: single row (1, 2, or 3 cols)
 * - 4+ items: ceil(√n) so the grid stays roughly square
 */
export function getViewGridColumns(count: number): number {
  if (count <= 3) return count
  return Math.ceil(Math.sqrt(count))
}
