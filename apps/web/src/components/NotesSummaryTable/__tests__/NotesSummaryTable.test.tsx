import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { configureDemoMode, resetDemoMode } from "services"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { NotesSummaryTable } from "../NotesSummaryTable"

const useNotesQueryMock = vi.fn()
const resolveBadgeValuesMock = vi.fn()
const getColumnLabelMock = vi.fn()
const sortNotesMock = vi.fn()
const useColumnSortMock = vi.fn()
const toggleSortMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: () => useNotesQueryMock(),
  }
})

vi.mock("../NotesSummaryTable.util", () => ({
  resolveBadgeValues: (...args: unknown[]) => resolveBadgeValuesMock(...args),
  getColumnLabel: (...args: unknown[]) => getColumnLabelMock(...args),
  sortNotes: (...args: unknown[]) => sortNotesMock(...args),
  getAriaSort: (isActive: boolean, direction: "asc" | "desc") => {
    if (!isActive) return "none"
    return direction === "asc" ? "ascending" : "descending"
  },
  nameColumnSortKey: "title",
}))

vi.mock("../../../hooks/useColumnSort/useColumnSort", () => ({
  useColumnSort: (...args: unknown[]) => useColumnSortMock(...args),
}))

vi.mock("../../AppError", () => ({
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
    sortNotesMock.mockReset()
    sortNotesMock.mockImplementation((notes: unknown[]) => notes)
    useColumnSortMock.mockReset()
    toggleSortMock.mockReset()
    useColumnSortMock.mockReturnValue({
      sortKey: "__none__",
      direction: "asc",
      toggleSort: toggleSortMock,
    })
  })

  afterEach(() => {
    cleanup()
    resetDemoMode()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [] },
      error: new Error("Request failed"),
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

  test("links note titles to the in-app note source route in demo mode", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "Book One",
            obsidianUrl: "obsidian://open?vault=v&file=book-one",
            folder: "books",
            frontmatter: { type: "book" },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderSummaryList()

    expect(screen.getByRole("link", { name: "Book One" }).getAttribute("href")).toBe("/source/1")
  })

  test("initializes sorting with a storage key derived from the current view", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] }, error: undefined })

    renderSummaryList()

    expect(useColumnSortMock).toHaveBeenCalledWith({
      storageKey: "mdm.notesSummaryTable.sort.books",
      defaultSortKey: "title",
    })
  })

  test("sorts the rendered notes using the current sort key and direction", () => {
    useColumnSortMock.mockReturnValue({
      sortKey: "frontmatter.type",
      direction: "desc",
      toggleSort: toggleSortMock,
    })
    const notes = [
      { id: "1", title: "Book One", obsidianUrl: "o1", folder: "books", frontmatter: {} },
      { id: "2", title: "Book Two", obsidianUrl: "o2", folder: "books", frontmatter: {} },
    ]
    useNotesQueryMock.mockReturnValue({ data: { notes }, error: undefined })

    renderSummaryList()

    expect(sortNotesMock).toHaveBeenCalledWith(notes, "frontmatter.type", "desc")
  })

  test("toggles sorting when the name column or a badge column header is clicked", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] }, error: undefined })

    renderSummaryList(["folder"])

    fireEvent.click(screen.getByText("notes.nameColumn").closest("button") as HTMLElement)
    fireEvent.click(screen.getByText("folder").closest("button") as HTMLElement)

    expect(toggleSortMock).toHaveBeenNthCalledWith(1, "title")
    expect(toggleSortMock).toHaveBeenNthCalledWith(2, "folder")
  })

  test("marks the active sort column with aria-sort and a direction indicator", () => {
    useColumnSortMock.mockReturnValue({
      sortKey: "folder",
      direction: "desc",
      toggleSort: toggleSortMock,
    })
    useNotesQueryMock.mockReturnValue({ data: { notes: [] }, error: undefined })

    renderSummaryList(["folder"])

    const nameHeader = screen.getByText("notes.nameColumn").closest("th")
    const folderHeader = screen.getByText("folder").closest("th")

    expect(nameHeader?.getAttribute("aria-sort")).toBe("none")
    expect(folderHeader?.getAttribute("aria-sort")).toBe("descending")
    expect(folderHeader?.textContent).toContain("▼")
  })
})
