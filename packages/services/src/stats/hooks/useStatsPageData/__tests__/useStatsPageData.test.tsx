import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { setStatsBaseUrl } from "../../../../config"
import { configureDemoMode, resetDemoMode } from "../../../../demo/demoMode"
import { useStatsPageData } from "../useStatsPageData"

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
          <Suspense fallback={<div data-testid="loading" />}>{children}</Suspense>
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

describe("useStatsPageData", () => {
  test("fetches meta and history and returns both", async () => {
    const metaBody = { totalAttachments: {}, totalFolders: 1, totalNotes: 2, totalWords: 30 }
    const historyBody = [{ date: "2026-05-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 }]

    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(url.endsWith("/history") ? historyBody : metaBody),
    })))

    const { result } = renderHook(() => useStatsPageData(), { wrapper: createWrapper() })

    await waitFor(() => { expect(screen.queryByTestId("loading")).toBeNull(); })

    expect(result.current.meta).toEqual(metaBody)
    expect(result.current.history).toEqual(historyBody)
  })

  test("starts both requests up front instead of waiting for meta to resolve before starting history", async () => {
    let resolveMeta: (() => void) | undefined
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith("/history")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      }
      return new Promise((resolve) => {
        resolveMeta = () => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ totalAttachments: {}, totalFolders: 0, totalNotes: 0, totalWords: 0 }),
          })
        }
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    renderHook(() => useStatsPageData(), { wrapper: createWrapper() })

    // The history fetch must already have been requested even though the
    // meta fetch is still pending — proving the two queries were registered
    // together rather than history waiting on meta to resolve first.
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/stats/history")
    })
    expect(fetchMock).toHaveBeenCalledWith("/stats/meta")

    await act(async () => {
      resolveMeta?.()
      await Promise.resolve()
    })
  })

  test("throws to error boundary when either response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useStatsPageData(), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })

  test("fetches from the static demo data files in demo mode", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    }))

    renderHook(() => useStatsPageData(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/demo-data/stats.meta.json")
      expect(global.fetch).toHaveBeenCalledWith("/demo-data/stats.history.json")
    })
  })
})
