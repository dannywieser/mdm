import { useEffect, useState } from "react"

import type { UseRotationTickOptions } from "./useRotationTick.types"

// A single incrementing counter driven by one interval, meant to be called once
// per gallery and shared across every card so N cards don't each run their own timer.
export function useRotationTick({ intervalMs }: UseRotationTickOptions): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((current) => current + 1)
    }, intervalMs)

    return () => { clearInterval(timer); }
  }, [intervalMs])

  return tick
}
