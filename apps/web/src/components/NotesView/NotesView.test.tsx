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
  NotesList: () => <div>notes-list</div>,
}))

vi.mock("../NotesReview/NotesReview", () => ({
  NotesReview: () => <div>notes-review</div>,
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
  test("renders loading state while stats are loading", () => {
    useStatsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderNotesView("/notes/today")

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })

  test("renders NotesReview when configured component is NotesReview", () => {
    useStatsQueryMock.mockReturnValue({
      data: {
        modifiedToday: 0,
        totalNotes: 1,
        views: [
          {
            component: "NotesReview",
            count: 1,
            id: "today",
            name: "Today",
          },
        ],
      },
      isLoading: false,
    })

    renderNotesView("/notes/today")

    expect(screen.getByText("notes-review")).toBeTruthy()
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
      isLoading: false,
    })

    renderNotesView("/notes/unknown")

    expect(screen.getByText("notes-list")).toBeTruthy()
  })
})
