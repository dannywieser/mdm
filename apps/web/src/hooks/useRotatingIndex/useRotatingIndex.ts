import { useEffect, useState } from "react"

import type { UseRotatingIndexOptions } from "./useRotatingIndex.types"

export function useRotatingIndex({ intervalMs, length }: UseRotatingIndexOptions): number {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (length <= 1) return

    const timer = setInterval(() => {
      setIndex((current) => current + 1)
    }, intervalMs)

    return () => { clearInterval(timer); }
  }, [length, intervalMs])

  return length > 0 ? index % length : 0
}
