import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { Home } from "./Home"

const useStatsQueryMock = vi.fn()

vi.mock("../../hooks/useStatsQuery/useStatsQuery", () => ({
  useStatsQuery: () => useStatsQueryMock(),
}))

describe("Home", () => {
  test("renders core stats and view links", () => {
    useStatsQueryMock.mockReturnValue({
      isLoading: false,
      data: {
        totalNotes: 12,
        modifiedToday: 3,
        views: [
          { component: "NotesList", count: 4, id: "books", name: "Books" },
        ],
      },
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByText("3")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /books/i }).getAttribute("href"),
    ).toBe("/notes/books")
  })
})
