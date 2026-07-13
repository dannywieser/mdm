import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { NotesGallery } from "../NotesGallery"

const renderGallery = (badges: string[] = [], coverProperty = "cover") =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <Routes>
          <Route path="/notes/:view" element={<NotesGallery badges={badges} coverProperty={coverProperty} />} />
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
  frontmatter: { cover: "https://example.com/cover.jpg" },
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

  test("filters using the configured coverProperty instead of the hardcoded cover key", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "3",
            title: "Thumbnail Note",
            obsidianUrl: "obsidian://open?vault=v&file=3",
            frontmatter: { thumbnail: "https://example.com/thumb.jpg" },
          },
          noteWithCover,
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery([], "thumbnail")

    expect(screen.getByText("Thumbnail Note")).toBeTruthy()
    expect(screen.queryByText("With Cover")).toBeNull()
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
})
