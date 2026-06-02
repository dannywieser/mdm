import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { NotesList } from "./NotesList"

const useNotesQueryMock = vi.fn()

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../NotesCard/NotesCard", () => ({
  NotesCard: ({ note }: { note: { title: string } }) => <div>{note.title}</div>,
}))

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

describe("NotesList", () => {
  test("renders the loading screen while fetching", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesList />
      </ChakraProvider>,
    )

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Request failed"),
      isLoading: false,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesList />
      </ChakraProvider>,
    )

    expect(screen.getByText("unable to load notes")).toBeTruthy()
    expect(screen.getByText("Request failed")).toBeTruthy()
  })

  test("renders notes when query succeeds", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", title: "Note 1" },
          { id: "2", title: "Note 2" },
        ],
        notesDirectory: "/notes",
        obsidianVault: "vault",
      },
      error: undefined,
      isLoading: false,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesList />
      </ChakraProvider>,
    )

    expect(screen.getByText("Note 1")).toBeTruthy()
    expect(screen.getByText("Note 2")).toBeTruthy()
  })
})
