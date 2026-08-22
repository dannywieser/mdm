import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { TransactionsResponse } from "../../../transactions.types"

import { configureDemoMode, resetDemoMode } from "../../../../demo/demoMode"
import { useTransactionsQuery } from "../useTransactionsQuery"

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

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

const responseBody: TransactionsResponse = {
  currency: "USD",
  from: "2026-03-01",
  to: "2026-03-31",
  totals: { expense: -82.4, income: 0, logged: -82.4, net: -82.4, scheduled: 0 },
  transactions: [
    {
      amount: -82.4,
      category: "food",
      date: "2026-03-04",
      description: "Groceries",
      id: "note-1:2026-03-04",
      noteId: "note-1",
      obsidianUrl: "obsidian://note-1",
      recurrence: null,
      status: "logged",
    },
  ],
}

const stubFetch = (body: TransactionsResponse) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(body) }),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  resetDemoMode()
})

describe("useTransactionsQuery", () => {
  test("requests the transactions for the given month", async () => {
    stubFetch(responseBody)

    const { result } = renderHook(() => useTransactionsQuery({ month: "2026-03" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(global.fetch).toHaveBeenCalledWith("/transactions?month=2026-03")
    expect(result.current.data).toEqual(responseBody)
  })

  test("requests a far-future month the same way as a current one", async () => {
    stubFetch(responseBody)

    const { result } = renderHook(() => useTransactionsQuery({ month: "2099-07" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(global.fetch).toHaveBeenCalledWith("/transactions?month=2099-07")
  })

  test("reads the static snapshot and narrows it to the month in demo mode", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    stubFetch({
      ...responseBody,
      transactions: [
        ...responseBody.transactions,
        { ...responseBody.transactions[0], date: "2026-04-04", id: "note-1:2026-04-04" },
      ],
    })

    const { result } = renderHook(() => useTransactionsQuery({ month: "2026-03" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(global.fetch).toHaveBeenCalledWith("/demo-data/transactions.json")
    expect(result.current.data.transactions.map(({ date }) => date)).toEqual(["2026-03-04"])
  })

  test("throws to the error boundary when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useTransactionsQuery({ month: "2026-03" }), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
