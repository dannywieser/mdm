import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { useRotatingIndex } from "../useRotatingIndex"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useRotatingIndex", () => {
  test("starts at index 0", () => {
    const { result } = renderHook(() => useRotatingIndex({ intervalMs: 10000, length: 3 }))

    expect(result.current).toBe(0)
  })

  test("advances to the next index after the interval elapses", () => {
    const { result } = renderHook(() => useRotatingIndex({ intervalMs: 10000, length: 3 }))

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current).toBe(1)
  })

  test("wraps back to 0 after reaching the last index", () => {
    const { result } = renderHook(() => useRotatingIndex({ intervalMs: 10000, length: 2 }))

    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(result.current).toBe(1)

    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(result.current).toBe(0)
  })

  test("does not rotate when there is only one image", () => {
    const { result } = renderHook(() => useRotatingIndex({ intervalMs: 10000, length: 1 }))

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(result.current).toBe(0)
  })

  test("returns 0 when there are no images", () => {
    const { result } = renderHook(() => useRotatingIndex({ intervalMs: 10000, length: 0 }))

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(result.current).toBe(0)
  })

  test("wraps the returned index into range when length shrinks", () => {
    const { rerender, result } = renderHook(
      ({ length }: { length: number }) => useRotatingIndex({ intervalMs: 10000, length }),
      { initialProps: { length: 3 } },
    )

    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(result.current).toBe(2)

    rerender({ length: 2 })

    expect(result.current).toBe(0)
  })
})
