import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { configureDemoMode, resetDemoMode } from "../../../../demo/demoMode"
import { useNotesQuery } from "../useNotesQuery"

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
})

describe("useNotesQuery", () => {
  test("fetches notes without a view filter when no view is provided", async () => {
    const responseBody = {
      notes: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(() => useNotesQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/api/notes")
    expect(result.current.data).toEqual(responseBody)
  })

  test("fetches notes with the view filter when a view is provided", async () => {
    const responseBody = {
      notes: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(
      () => useNotesQuery({ view: "on-this-day" }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/api/notes?view=on-this-day")
  })

  test("fetches notes with includeContent=false when content is not requested", async () => {
    const responseBody = {
      notes: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody),
    }))

    const { result } = renderHook(
      () => useNotesQuery({ includeContent: false, view: "on-this-day" }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/api/notes?view=on-this-day&includeContent=false")
  })

  test("fetches the static per-view file in demo mode", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ notes: [] }),
    }))

    const { result } = renderHook(
      () => useNotesQuery({ view: "books" }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/demo-data/notes.books.json")
  })

  test("fetches the slim static file in demo mode when content is not requested", async () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ notes: [] }),
    }))

    const { result } = renderHook(
      () => useNotesQuery({ includeContent: false, view: "books" }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/demo-data/notes.books.slim.json")
  })

  test("throws to error boundary when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useNotesQuery(), { wrapper: createWrapper() })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
