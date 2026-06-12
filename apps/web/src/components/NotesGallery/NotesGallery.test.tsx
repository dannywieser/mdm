import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { NotesGallery } from "./NotesGallery"

const renderGallery = (badges: string[] = []) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <Routes>
          <Route path="/notes/:view" element={<NotesGallery badges={badges} />} />
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

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

vi.mock("../AppError/AppError", () => ({
  AppError: ({ message }: { message: string }) => <div data-testid="app-error">{message}</div>,
}))

vi.mock("../NoteBadges/NoteBadges", () => ({
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
  test("renders the loading screen while fetching", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    renderGallery()

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Request failed"),
      isLoading: false,
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
})
