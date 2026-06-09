import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { NotesGallery } from "./NotesGallery"
import { filterNotesWithCovers, getCoverSrc } from "./NotesGallery.util"

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

describe("getCoverSrc", () => {
  test("builds a proxy URL from a string cover", () => {
    expect(getCoverSrc("attachments/cover.jpg")).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })

  test("uses the first element of an array cover", () => {
    expect(getCoverSrc(["attachments/first.jpg", "attachments/second.jpg"])).toBe(
      `/images?path=${encodeURIComponent("attachments/first.jpg")}`,
    )
  })
})

describe("filterNotesWithCovers", () => {
  const note = (cover: unknown) => ({ id: "1", frontmatter: cover !== undefined ? { cover } : {} }) as never

  test("includes notes with a string cover", () => {
    expect(filterNotesWithCovers([note("attachments/cover.jpg")])).toHaveLength(1)
  })

  test("includes notes with a non-empty array cover", () => {
    expect(filterNotesWithCovers([note(["attachments/cover.jpg"])])).toHaveLength(1)
  })

  test("excludes notes with no cover field", () => {
    expect(filterNotesWithCovers([note(undefined)])).toHaveLength(0)
  })

  test("excludes notes with an empty string cover", () => {
    expect(filterNotesWithCovers([note("")])).toHaveLength(0)
  })

  test("excludes notes with an empty array cover", () => {
    expect(filterNotesWithCovers([note([])])).toHaveLength(0)
  })

  test("excludes notes with an array whose first element is empty", () => {
    expect(filterNotesWithCovers([note([""])])).toHaveLength(0)
  })
})
