import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { type ReactNode } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { configureDemoMode, resetDemoMode } from "../../../demo/demoMode"
import { useIsRead } from "./useIsRead"

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function QueryWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return QueryWrapper
}

afterEach(() => {
  vi.restoreAllMocks()
  resetDemoMode()
  window.sessionStorage.clear()
})

describe("useIsRead", () => {
  test("fetches the note read state", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ value: true }),
    })

    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useIsRead({ noteId: "note-1" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetchMock).toHaveBeenCalledWith("/flags/note-1/read")
    expect(result.current.data).toBe(true)
  })

  test("reads the flag from session storage in demo mode without fetching", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    window.sessionStorage.setItem("mdm-demo-flag:read:note-1", "true")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useIsRead({ noteId: "note-1" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test("returns an error when the read state request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    })

    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useIsRead({ noteId: "note-1" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe("errors.unableToLoadReadState")
  })
})
