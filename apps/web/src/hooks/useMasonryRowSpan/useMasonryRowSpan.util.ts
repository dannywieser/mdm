export function calculateRowSpan(heightPx: number, rowHeightPx: number, gapPx: number): number {
  const rowAndGap = rowHeightPx + gapPx

  if (rowAndGap <= 0) return 1

  return Math.max(1, Math.ceil((heightPx + gapPx) / rowAndGap))
}
