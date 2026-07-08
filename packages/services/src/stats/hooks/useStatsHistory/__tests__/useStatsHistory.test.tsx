import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { setStatsBaseUrl } from "../../../../config"
import { configureDemoMode, resetDemoMode } from "../../../../demo/demoMode"
import { useStatsHistory } from "../useStatsHistory"

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render(): ReactNode {
    if (this.state.error) {
      return <div data-testid="error">{this.state.error.message}</div>
    }
    return <>{this.props.children}</>
  }
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function QueryWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    )
  }

  return QueryWrapper
}

afterEach(() => {
  vi.restoreAllMocks()
  resetDemoMode()
  setStatsBaseUrl("/stats")
})

describe("useStatsHistory", () => {
  test("fetches history successfully", async () => {
    const responseBody = [
      { date: "2026-05-01", entriesCreated: 3, entriesModified: 1, foldersTouched: 2 },
    ]

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(() => useStatsHistory(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/stats/history")
    expect(result.current.data).toEqual(responseBody)
  })

  test("fetches from the configured stats base url", async () => {
    setStatsBaseUrl("https://stats.example.com")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    }))

    renderHook(() => useStatsHistory(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("https://stats.example.com/history")
    })
  })

  test("fetches the static stats history file in demo mode", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    }))

    const { result } = renderHook(() => useStatsHistory(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/demo-data/stats.history.json")
  })

  test("throws to error boundary when the history response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useStatsHistory(), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
