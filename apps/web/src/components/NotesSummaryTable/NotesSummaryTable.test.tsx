import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { NotesSummaryTable } from "./NotesSummaryTable"

const useNotesQueryMock = vi.fn()
const resolveBadgeValuesMock = vi.fn()
const getColumnLabelMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: () => useNotesQueryMock(),
  }
})

vi.mock("./NotesSummaryTable.util", () => ({
  resolveBadgeValues: (...args: unknown[]) => resolveBadgeValuesMock(...args),
  getColumnLabel: (...args: unknown[]) => getColumnLabelMock(...args),
}))

vi.mock("../LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

vi.mock("../AppError", () => ({
  AppError: ({ message }: { message: string }) => <div data-testid="app-error">{message}</div>,
}))

const renderSummaryList = (badges: string[] = []) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <Routes>
          <Route path="/notes/:view" element={<NotesSummaryTable badges={badges} />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesSummaryTable", () => {
  beforeEach(() => {
    resolveBadgeValuesMock.mockReset()
    getColumnLabelMock.mockReset()
    getColumnLabelMock.mockImplementation((badge: string) => badge)
  })

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
    getColumnLabelMock.mockImplementation((badge: string) => badge.split(".").at(-1) ?? badge)
    resolveBadgeValuesMock.mockImplementation((note: { id: string }, badge: string) => {
      const values: Record<string, string[]> = {
        "1-folder": ["books"],
        "1-frontmatter.type": ["book"],
        "1-frontmatter.genre": ["fiction", "mystery"],
        "2-folder": ["books"],
        "2-frontmatter.type": ["book"],
        "2-frontmatter.genre": ["history"],
      }

      return values[`${note.id}-${badge}`] ?? []
    })

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
    expect(getColumnLabelMock).toHaveBeenCalledWith("folder")
    expect(getColumnLabelMock).toHaveBeenCalledWith("frontmatter.type")
    expect(getColumnLabelMock).toHaveBeenCalledWith("frontmatter.genre")
    expect(resolveBadgeValuesMock).toHaveBeenCalledTimes(6)
    expect(resolveBadgeValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1", title: "Book One" }),
      "folder",
    )
    expect(resolveBadgeValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "2", title: "Book Two" }),
      "frontmatter.genre",
    )
  })
})
