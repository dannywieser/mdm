import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { NotesView } from "./NotesView"

const useViewsQueryMock = vi.fn()

vi.mock("../../hooks/useViewsQuery/useViewsQuery", () => ({
  useViewsQuery: () => useViewsQueryMock(),
}))

vi.mock("../NotesList/NotesList", () => ({
  NotesList: ({ badges }: { badges?: string[] }) => (
    <div>{`notes-list:${badges?.join(",") ?? ""}`}</div>
  ),
}))

vi.mock("../NotesReview/NotesReview", () => ({
  NotesReview: ({ badges }: { badges?: string[] }) => (
    <div>{`notes-review:${badges?.join(",") ?? ""}`}</div>
  ),
}))

vi.mock("../NotesSummaryTable/NotesSummaryTable", () => ({
  NotesSummaryTable: ({ badges }: { badges?: string[] }) => (
    <div>{`note-summary-list:${badges?.join(",") ?? ""}`}</div>
  ),
}))

const renderNotesView = (path: string) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/notes/:view" element={<NotesView />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesView", () => {
  test("renders NotesReview when configured component is NotesReview", () => {
    useViewsQueryMock.mockReturnValue({
      data: {
        views: [
          {
            component: "NotesReview",
            count: 1,
            badges: ["folder", "frontmatter.type"],
            id: "today",
            name: "Today",
          },
        ],
      },
    })

    renderNotesView("/notes/today")

    expect(screen.getByText("notes-review:folder,frontmatter.type")).toBeTruthy()
  })

  test("falls back to NotesList when component is missing", () => {
    useViewsQueryMock.mockReturnValue({
      data: {
        views: [
          { component: "NotesList", count: 1, id: "books", name: "Books" },
        ],
      },
    })

    renderNotesView("/notes/unknown")

    expect(screen.getByText("notes-list:")).toBeTruthy()
  })

  test("renders NotesSummaryTable when configured component is NotesSummaryTable", () => {
    useViewsQueryMock.mockReturnValue({
      data: {
        views: [
          {
            component: "NotesSummaryTable",
            count: 1,
            badges: ["folder", "frontmatter.genre"],
            id: "books",
            name: "Books",
          },
        ],
      },
    })

    renderNotesView("/notes/books")

    expect(screen.getByText("note-summary-list:folder,frontmatter.genre")).toBeTruthy()
  })
})
