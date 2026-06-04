import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { NoteSummaryList } from "./NoteSummaryList"

const useNotesQueryMock = vi.fn()

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

vi.mock("../AppError/AppError", () => ({
  AppError: ({ message }: { message: string }) => <div data-testid="app-error">{message}</div>,
}))

const renderSummaryList = (badges: string[] = []) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <Routes>
          <Route path="/notes/:view" element={<NoteSummaryList badges={badges} />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NoteSummaryList", () => {
  test("renders the loading screen while fetching", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    renderSummaryList()

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Request failed"),
      isLoading: false,
    })

    renderSummaryList()

    expect(screen.getByTestId("app-error")).toBeTruthy()
    expect(screen.getByText("Request failed")).toBeTruthy()
  })

  test("renders summary table with dynamic badge columns", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "Book One",
            obsidianUrl: "obsidian://open?vault=v&file=book-one",
            folder: "books",
            frontmatter: { type: "book", genre: ["fiction", "mystery"] },
          },
          {
            id: "2",
            title: "Book Two",
            obsidianUrl: "obsidian://open?vault=v&file=book-two",
            folder: "books",
            frontmatter: { type: "book", genre: "history" },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderSummaryList(["folder", "frontmatter.type", "frontmatter.genre"])

    expect(screen.getByText("notes.matchedCount")).toBeTruthy()
    expect(screen.getByRole("link", { name: "review.backToHome" }).getAttribute("href")).toBe("/")
    expect(screen.getByText("notes.nameColumn")).toBeTruthy()
    expect(screen.getByText("folder")).toBeTruthy()
    expect(screen.getByText("type")).toBeTruthy()
    expect(screen.getByText("genre")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Book One" }).getAttribute("href")).toBe(
      "obsidian://open?vault=v&file=book-one",
    )
    expect(screen.getAllByText("books").length).toBeGreaterThan(0)
    expect(screen.getAllByText("book").length).toBeGreaterThan(0)
    expect(screen.getByText("fiction")).toBeTruthy()
    expect(screen.getByText("mystery")).toBeTruthy()
    expect(screen.getByText("history")).toBeTruthy()
  })
})
