import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { NotesView } from "./NotesView"

const useStatsQueryMock = vi.fn()

vi.mock("../../hooks/useStatsQuery/useStatsQuery", () => ({
  useStatsQuery: () => useStatsQueryMock(),
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
    useStatsQueryMock.mockReturnValue({
      data: {
        modifiedToday: 0,
        totalNotes: 1,
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
    useStatsQueryMock.mockReturnValue({
      data: {
        modifiedToday: 0,
        totalNotes: 1,
        views: [
          { component: "NotesList", count: 1, id: "books", name: "Books" },
        ],
      },
    })

    renderNotesView("/notes/unknown")

    expect(screen.getByText("notes-list:")).toBeTruthy()
  })
})
