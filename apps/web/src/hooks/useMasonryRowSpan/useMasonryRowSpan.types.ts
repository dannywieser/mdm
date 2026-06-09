export interface UseMasonryRowSpanOptions {
  gapPx: number
  rowHeightPx: number
}

export interface UseMasonryRowSpanResult {
  ref: (element: HTMLElement | null) => void
  rowSpan: number
}
