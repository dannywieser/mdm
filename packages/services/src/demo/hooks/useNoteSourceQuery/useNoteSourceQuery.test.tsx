import { Component, Suspense, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { configureDemoMode, resetDemoMode } from "../../demoMode"
import { useNoteSourceQuery } from "./useNoteSourceQuery"

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

beforeEach(() => {
  configureDemoMode({ dataBasePath: "/demo-data" })
})

afterEach(() => {
  vi.restoreAllMocks()
  resetDemoMode()
})

describe("useNoteSourceQuery", () => {
  test("fetches the note's markdown source from the demo snapshot", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("---\ncreated: 2024-01-01\n---\n\nBody."),
    }))

    const { result } = renderHook(() => useNoteSourceQuery({ noteId: "note-1" }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })

    expect(global.fetch).toHaveBeenCalledWith("/demo-data/source/note-1.md")
    expect(result.current.data).toBe("---\ncreated: 2024-01-01\n---\n\nBody.")
  })

  test("throws to error boundary when the source file is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderHook(() => useNoteSourceQuery({ noteId: "note-1" }), {
      wrapper: createWrapper(),
    })

    expect(await screen.findByTestId("error")).toBeTruthy()
  })
})
