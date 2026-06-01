import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NotesList } from "./NotesList"

const useNotesQueryMock = vi.fn()

vi.mock("../hooks/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("./NotesCard", () => ({
  NotesCard: ({ note }: { note: { title: string } }) => <div>{note.title}</div>,
}))

vi.mock("./LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

describe("NotesList", () => {
  it("renders the loading screen while fetching", () => {
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

  it("renders an error state", () => {
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

    expect(screen.getByText("Unable to load notes.")).toBeTruthy()
    expect(screen.getByText("Request failed")).toBeTruthy()
  })

  it("renders notes when query succeeds", () => {
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
