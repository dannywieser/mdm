import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReview } from "./NotesReview"

const useNotesQueryMock = vi.fn()
const useToggleNoteReadMock = vi.fn()

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../../hooks/useToggleNoteRead/useToggleNoteRead", () => ({
  useToggleNoteRead: () => useToggleNoteReadMock(),
}))

vi.mock("../MarkdownTree/MarkdownTree", () => ({
  MarkdownTree: () => null,
}))

const defaultMutate = vi.fn()

afterEach(() => {
  cleanup()
})

describe("NotesReview", () => {
  const renderComponent = () =>
    render(
      <ChakraProvider value={defaultSystem}>
        <NotesReview />
      </ChakraProvider>,
    )

  test("renders the notebook icon while fetching", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })

    renderComponent()

    expect(screen.getByRole("img", { name: "Notebook" })).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Request failed"),
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })

    renderComponent()

    expect(screen.getByText("notes.errorTitle")).toBeTruthy()
  })

  test("renders all caught up when there are no notes", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [] },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })

    renderComponent()

    expect(screen.getByText("review.allCaughtUp")).toBeTruthy()
  })

  test("renders progress indicator for the current note", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })

    renderComponent()

    expect(screen.getByText("review.progress")).toBeTruthy()
  })

  test("advances to the next note when mark as read succeeds", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    const mutateMock = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    })

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(mutateMock).toHaveBeenCalled()
    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://note-2")
  })

  test("advances to the next note when skip is clicked without marking as read", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "review.skip" }))

    expect(defaultMutate).not.toHaveBeenCalled()
    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://note-2")
  })

  test("shows all caught up after reviewing all notes", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [{ id: "1", title: "Note 1" }] },
      error: undefined,
      isLoading: false,
    })
    const mutateMock = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    })

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(screen.getByText("review.allCaughtUp")).toBeTruthy()
  })
})
