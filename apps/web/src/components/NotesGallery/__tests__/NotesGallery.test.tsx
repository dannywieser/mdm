import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { NotesGallery } from "../NotesGallery"

const renderGallery = (
  badges: string[] = [],
  path = "/notes/books",
  frontmatterFilters: string[] = [],
) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/notes/:view"
            element={<NotesGallery badges={badges} frontmatterFilters={frontmatterFilters} />}
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

const useNotesQueryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: () => useNotesQueryMock(),
  }
})

vi.mock("../../AppError", () => ({
  AppError: ({ message }: { message: string }) => <div data-testid="app-error">{message}</div>,
}))

vi.mock("../../NoteBadges", () => ({
  NoteBadges: ({ badges }: { badges: string[] }) => (
    <div data-testid="note-badges">{badges.join(",")}</div>
  ),
}))

const noteWithCover = {
  id: "1",
  title: "With Cover",
  obsidianUrl: "obsidian://open?vault=v&file=1",
  frontmatter: { images: ["https://example.com/cover.jpg"] },
}

describe("NotesGallery", () => {
  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [] },
      error: new Error("Request failed"),
    })

    renderGallery()

    expect(screen.getByTestId("app-error")).toBeTruthy()
    expect(screen.getByText("Request failed")).toBeTruthy()
  })

  test("renders only notes that have a cover image", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          noteWithCover,
          {
            id: "2",
            title: "No Cover",
            obsidianUrl: "obsidian://open?vault=v&file=2",
            frontmatter: {},
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery()

    expect(screen.getByText("With Cover")).toBeTruthy()
    expect(screen.queryByText("No Cover")).toBeNull()
  })

  test("renders NoteBadges with configured badges", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [noteWithCover] },
      error: undefined,
      isLoading: false,
    })

    renderGallery(["frontmatter.genre", "frontmatter.status"])

    expect(screen.getAllByTestId("note-badges").length).toBeGreaterThan(0)
    expect(screen.getAllByText("frontmatter.genre,frontmatter.status").length).toBeGreaterThan(0)
  })

  test("renders notes in a masonry grid", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [noteWithCover] },
      error: undefined,
      isLoading: false,
    })

    renderGallery()

    expect(screen.getByTestId("gallery-grid")).toBeTruthy()
  })

  test("renders a filters button", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [noteWithCover] },
      error: undefined,
      isLoading: false,
    })

    renderGallery()

    expect(screen.getByRole("button", { name: "gallery.filters" })).toBeTruthy()
  })

  test("opens the filter panel with year and frontmatter facets on click", async () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            ...noteWithCover,
            createdDate: "2024-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover.jpg"], type: "game" },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery([], "/notes/books", ["type"])
    fireEvent.click(screen.getByRole("button", { name: "gallery.filters" }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2024" })).toBeTruthy()
      expect(screen.getByRole("button", { name: "game" })).toBeTruthy()
    })
  })

  test("only shows search and the year facet when frontmatterFilters is not configured", async () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            ...noteWithCover,
            createdDate: "2024-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover.jpg"], type: "game" },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery()
    fireEvent.click(screen.getByRole("button", { name: "gallery.filters" }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2024" })).toBeTruthy()
    })
    expect(screen.queryByRole("button", { name: "game" })).toBeNull()
  })

  test("ignores a configured frontmatterFilters key that no note actually has", async () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            ...noteWithCover,
            createdDate: "2024-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover.jpg"], type: "game" },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery([], "/notes/books", ["type", "missingKey"])
    fireEvent.click(screen.getByRole("button", { name: "gallery.filters" }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "game" })).toBeTruthy()
    })
    expect(screen.queryByText("missingKey")).toBeNull()
  })

  test("selecting a year facet filters the grid down to matching notes", async () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "Old Note",
            obsidianUrl: "obsidian://open?vault=v&file=1",
            createdDate: "2022-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover1.jpg"] },
          },
          {
            id: "2",
            title: "New Note",
            obsidianUrl: "obsidian://open?vault=v&file=2",
            createdDate: "2024-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover2.jpg"] },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery()
    fireEvent.click(screen.getByRole("button", { name: "gallery.filters" }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2024" })).toBeTruthy()
    })
    fireEvent.click(screen.getByRole("button", { name: "2024" }))

    await waitFor(() => {
      expect(screen.getByText("New Note")).toBeTruthy()
      expect(screen.queryByText("Old Note")).toBeNull()
    })
  })

  // The chips row lives in the main page, outside the drawer's portal, so while the
  // drawer is open Chakra marks it aria-hidden/inert (correct modal a11y behavior) —
  // close the drawer before querying/interacting with a chip, matching real usage.
  test("shows an active filter chip after selecting a year, and clicking it clears the filter", async () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "Old Note",
            obsidianUrl: "obsidian://open?vault=v&file=1",
            createdDate: "2022-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover1.jpg"] },
          },
          {
            id: "2",
            title: "New Note",
            obsidianUrl: "obsidian://open?vault=v&file=2",
            createdDate: "2024-01-01T00:00:00.000Z",
            frontmatter: { images: ["https://example.com/cover2.jpg"] },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery()
    fireEvent.click(screen.getByRole("button", { name: "gallery.filters" }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2024" })).toBeTruthy()
    })
    fireEvent.click(screen.getByRole("button", { name: "2024" }))
    fireEvent.click(screen.getByRole("button", { name: "gallery.closeFilters" }))

    const chip = await screen.findByRole("button", { name: "gallery.removeFilter" })
    expect(chip).toBeTruthy()
    expect(screen.queryByText("Old Note")).toBeNull()

    fireEvent.click(chip)

    await waitFor(() => {
      expect(screen.getByText("Old Note")).toBeTruthy()
      expect(screen.queryByRole("button", { name: "gallery.removeFilter" })).toBeNull()
    })
  })

  test("honors an fm.* filter in the URL even when its key isn't part of the current view's facets", async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [noteWithCover] },
      error: undefined,
      isLoading: false,
    })

    renderGallery([], "/notes/books?fm.status=archived")

    expect(screen.queryByText("With Cover")).toBeNull()
    const chip = await screen.findByRole("button", { name: "gallery.removeFilter" })
    expect(chip).toBeTruthy()

    fireEvent.click(chip)

    await waitFor(() => {
      expect(screen.getByText("With Cover")).toBeTruthy()
    })
  })

  test("de-duplicates year selections that are distinct strings but the same number", async () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            ...noteWithCover,
            createdDate: "2024-01-01T00:00:00.000Z",
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery([], "/notes/books?year=2024&year=02024")

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "gallery.removeFilter" })).toHaveLength(1)
    })
  })
})
