import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useStatsQuery } from "./useStatsQuery"

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
})

describe("useStatsQuery", () => {
  test("fetches stats successfully", async () => {
    const responseBody = {
      totalNotes: 2,
      modifiedToday: 1,
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(() => useStatsQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/api/stats")
    expect(result.current.data).toEqual(responseBody)
  })

  test("throws to error boundary when the stats response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useStatsQuery(), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
