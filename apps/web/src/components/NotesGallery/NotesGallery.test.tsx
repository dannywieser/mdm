import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

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

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
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

    expect(screen.getByText("notes.errorTitle")).toBeTruthy()
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

  test("uses the first element when cover is an array", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            title: "Array Cover",
            obsidianUrl: "obsidian://open?vault=v&file=1",
            frontmatter: {
              cover: ["https://example.com/first.jpg", "https://example.com/second.jpg"],
            },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderGallery()

    const img = screen.getByRole("img", { name: "Array Cover" })
    expect(img.getAttribute("src")).toBe(
      `/images?path=${encodeURIComponent("https://example.com/first.jpg")}`,
    )
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
})
