import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { useRotationTick } from "../useRotationTick"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useRotationTick", () => {
  test("starts at 0", () => {
    const { result } = renderHook(() => useRotationTick({ intervalMs: 10000 }))

    expect(result.current).toBe(0)
  })

  test("increments once per interval", () => {
    const { result } = renderHook(() => useRotationTick({ intervalMs: 10000 }))

    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(result.current).toBe(1)

    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(result.current).toBe(3)
  })

  test("uses a single interval regardless of how many consumers read it", () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval")

    renderHook(() => useRotationTick({ intervalMs: 10000 }))

    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
  })
})
