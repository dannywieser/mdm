import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { Home } from "./Home"
import { getViewGridColumns } from "./Home.util"

const useStatsQueryMock = vi.fn()

vi.mock("../../hooks/useStatsQuery/useStatsQuery", () => ({
  useStatsQuery: () => useStatsQueryMock(),
}))

describe("Home", () => {
  test("renders view links with name and count", () => {
    useStatsQueryMock.mockReturnValue({
      isLoading: false,
      data: {
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

    expect(screen.getByText("Books")).toBeTruthy()
    expect(screen.getByText("4")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /books/i }).getAttribute("href"),
    ).toBe("/notes/books")
  })
})

describe("getViewGridColumns", () => {
  test("returns 1 for one item", () => {
    expect(getViewGridColumns(1)).toBe(1)
  })

  test("returns 2 for two items", () => {
    expect(getViewGridColumns(2)).toBe(2)
  })

  test("returns 3 for three items", () => {
    expect(getViewGridColumns(3)).toBe(3)
  })

  test("returns 2 for four items", () => {
    expect(getViewGridColumns(4)).toBe(2)
  })

  test("returns 3 for five items", () => {
    expect(getViewGridColumns(5)).toBe(3)
  })

  test("returns 3 for nine items", () => {
    expect(getViewGridColumns(9)).toBe(3)
  })

  test("returns 4 for ten items", () => {
    expect(getViewGridColumns(10)).toBe(4)
  })
})
