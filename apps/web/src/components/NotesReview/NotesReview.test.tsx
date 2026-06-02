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

vi.mock("../NotebookIcon/NotebookIcon", () => ({
  NotebookIcon: () => <div data-testid="notebook-icon" />,
}))

vi.mock("../AppError/AppError", () => ({
  AppError: ({ message }) => <div data-testid="app-error">{message}</div>,
}))

vi.mock("../MarkdownTree/MarkdownTree", () => ({
  MarkdownTree: () => <div data-testid="markdown-tree" />,
}))

const defaultMutate = vi.fn()

afterEach(() => {
  cleanup()
})

const renderComponent = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <NotesReview />
    </ChakraProvider>,
  )

describe("NotesReview", () => {
  test("renders the notebook icon while fetching", () => {
    useNotesQueryMock.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
    useToggleNoteReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })

    renderComponent()

    expect(screen.getByTestId("notebook-icon")).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Request failed"),
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })

    renderComponent()

    expect(screen.getByTestId("app-error")).toBeTruthy()
  })

  test("renders all caught up when there are no notes", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [] },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })

    renderComponent()

    expect(screen.getByText("All caught up!")).toBeTruthy()
  })

  test("renders the note content with progress indicator", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", title: "Note 1" },
          { id: "2", title: "Note 2" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })

    renderComponent()

    expect(screen.getByTestId("markdown-tree")).toBeTruthy()
    expect(screen.getByText("1 of 2")).toBeTruthy()
  })

  test("advances to the next note when mark as read succeeds", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", title: "Note 1" },
          { id: "2", title: "Note 2" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    const mutateMock = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    useToggleNoteReadMock.mockReturnValue({ mutate: mutateMock, isPending: false })

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "mark as read" }))

    expect(mutateMock).toHaveBeenCalled()
    expect(screen.getByText("2 of 2")).toBeTruthy()
  })

  test("advances to the next note when skip is clicked without marking as read", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", title: "Note 1" },
          { id: "2", title: "Note 2" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "Skip" }))

    expect(defaultMutate).not.toHaveBeenCalled()
    expect(screen.getByText("2 of 2")).toBeTruthy()
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
    useToggleNoteReadMock.mockReturnValue({ mutate: mutateMock, isPending: false })

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "mark as read" }))

    expect(screen.getByText("All caught up!")).toBeTruthy()
  })
})
