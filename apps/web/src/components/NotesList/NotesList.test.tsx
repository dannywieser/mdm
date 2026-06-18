import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { NotesList } from "./NotesList"

const useNotesQueryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: () => useNotesQueryMock(),
  }
})

vi.mock("../NotesCard", () => ({
  NotesCard: ({
    note,
    badges,
  }: {
    badges?: string[]
    note: { title: string }
  }) => <div>{`${note.title}:${badges?.join(",") ?? ""}`}</div>,
}))

describe("NotesList", () => {
  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [] },
      error: new Error("Request failed"),
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <NotesList />
      </ChakraProvider>,
    )

    expect(screen.getByText("notes.errorTitle")).toBeTruthy()
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
        <NotesList badges={["folder"]} />
      </ChakraProvider>,
    )

    expect(screen.getByText("Note 1:folder")).toBeTruthy()
    expect(screen.getByText("Note 2:folder")).toBeTruthy()
  })
})
