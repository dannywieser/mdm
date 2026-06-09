import { useCallback, useRef, useState } from "react"

import { calculateRowSpan } from "./useMasonryRowSpan.util"
import type { UseMasonryRowSpanOptions, UseMasonryRowSpanResult } from "./useMasonryRowSpan.types"

export function useMasonryRowSpan({
  gapPx,
  rowHeightPx,
}: UseMasonryRowSpanOptions): UseMasonryRowSpanResult {
  const [rowSpan, setRowSpan] = useState(1)
  const observerRef = useRef<ResizeObserver | undefined>(undefined)

  const ref = useCallback(
    (element: HTMLElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = undefined

      if (!element) return

      const updateRowSpan = () => {
        setRowSpan(calculateRowSpan(element.offsetHeight, rowHeightPx, gapPx))
      }

      updateRowSpan()

      observerRef.current = new ResizeObserver(updateRowSpan)
      observerRef.current.observe(element)
    },
    [gapPx, rowHeightPx],
  )

  return { ref, rowSpan }
}
