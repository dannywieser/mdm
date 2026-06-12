import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useHabitQuery } from "./useHabitQuery"

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return <div data-testid="error">{this.state.error.message}</div>
    }
    return this.props.children
  }
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function QueryWrapper({ children }: { children: ReactNode }) {
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

describe("useHabitQuery", () => {
  test("fetches a habit by id successfully", async () => {
    const responseBody = {
      habitId: "exercise",
      habitName: "Daily Exercise",
      habitScore: 525,
      mode: "do-more",
      streak: 5,
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(() => useHabitQuery({ habitId: "exercise" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(global.fetch).toHaveBeenCalledWith("/habits/exercise")
    expect(result.current.data).toEqual(responseBody)
  })

  test("throws to error boundary when the habit response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => {})

    renderHook(() => useHabitQuery({ habitId: "exercise" }), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
