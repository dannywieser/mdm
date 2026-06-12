import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { type ReactNode } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useToggleRead } from "./useToggleRead"

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { QueryWrapper, queryClient }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useToggleRead", () => {
  test("posts the note read toggle and updates the cached value", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ value: true }),
    })

    vi.stubGlobal("fetch", fetchMock)

    const { QueryWrapper, queryClient } = createWrapper()
    const { result } = renderHook(
      () => useToggleRead({ noteId: "note-1" }),
      {
        wrapper: QueryWrapper,
      },
    )

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetchMock).toHaveBeenCalledWith("/flags/note-1/read", {
      method: "POST",
    })
    expect(queryClient.getQueryData(["read", "note-1"])).toBe(true)
  })

  test("returns an error when the toggle request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    })

    vi.stubGlobal("fetch", fetchMock)

    const { QueryWrapper } = createWrapper()
    const { result } = renderHook(
      () => useToggleRead({ noteId: "note-1" }),
      {
        wrapper: QueryWrapper,
      },
    )

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe("errors.unableToToggleReadState")
  })
})
