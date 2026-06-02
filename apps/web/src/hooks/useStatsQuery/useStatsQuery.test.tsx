import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { type ReactNode } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useStatsQuery } from "./useStatsQuery"

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return QueryWrapper
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useStatsQuery", () => {
  test("fetches stats successfully", async () => {
    const responseBody = {
      totalNotes: 2,
      modifiedToday: 1,
      views: [{ name: "books", count: 1 }],
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    })

    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useStatsQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetchMock).toHaveBeenCalledWith("/api/stats")
    expect(result.current.data).toEqual(responseBody)
  })

  test("returns an error when the stats response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })

    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useStatsQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe("unable to load stats")
  })
})
