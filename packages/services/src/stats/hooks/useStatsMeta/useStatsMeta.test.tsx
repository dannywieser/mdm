import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { setStatsBaseUrl } from "../../../config"
import { configureDemoMode, resetDemoMode } from "../../../demo/demoMode"
import { useStatsMeta } from "./useStatsMeta"

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

describe("useStatsMeta", () => {
  test("fetches stats successfully", async () => {
    const responseBody = {
      totalAttachments: { png: 2 },
      totalFolders: 4,
      totalNotes: 2,
      totalWords: 120,
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(() => useStatsMeta(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/stats/meta")
    expect(result.current.data).toEqual(responseBody)
  })

  test("fetches from the configured stats base url", async () => {
    setStatsBaseUrl("https://stats.example.com")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        totalAttachments: {},
        totalFolders: 0,
        totalNotes: 0,
        totalWords: 0,
      }),
    }))

    renderHook(() => useStatsMeta(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("https://stats.example.com/meta")
    })
  })

  test("fetches the static stats meta file in demo mode", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        totalAttachments: {},
        totalFolders: 1,
        totalNotes: 1,
        totalWords: 10,
      }),
    }))

    const { result } = renderHook(() => useStatsMeta(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/demo-data/stats.meta.json")
  })

  test("throws to error boundary when the stats response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useStatsMeta(), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
