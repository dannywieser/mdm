import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReview } from "./NotesReview"

const useNotesQueryMock = vi.fn()
const useToggleNoteReadMock = vi.fn()
const useQueriesMock = vi.fn()

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../../hooks/useToggleNoteRead/useToggleNoteRead", () => ({
  useToggleNoteRead: () => useToggleNoteReadMock(),
}))

vi.mock("../../hooks/useIsRead/useIsRead", () => ({
  fetchIsRead: vi.fn(),
}))

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return { ...actual, useQueries: () => useQueriesMock() }
})

vi.mock("../MarkdownTree/MarkdownTree", () => ({
  MarkdownTree: () => null,
}))

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

vi.mock("../../context/PageTitle/usePageTitle", () => ({
  usePageTitle: () => ({ title: "", setTitle: vi.fn() }),
}))

vi.mock("../OpenInObsidianButton/OpenInObsidianButton", () => ({
  OpenInObsidianButton: ({ note }: { note: { obsidianUrl: string } }) => (
    <a href={note.obsidianUrl}>open</a>
  ),
}))

vi.mock("./ReadNotesPanel", () => ({
  ReadNotesSidebar: () => null,
  ReadNotesMobileTrigger: ({ notes }: { notes: { id: string }[] }) =>
    notes.length > 0 ? <button>{notes.length}</button> : null,
}))

const defaultMutate = vi.fn()

const noReadStates = () => useQueriesMock.mockReturnValue([])
const readStatesFor = (ids: string[], readIds: string[]) =>
  useQueriesMock.mockReturnValue(
    ids.map((id) => ({ data: readIds.includes(id), status: "success" })),
  )

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

  test("renders the loading screen while fetching", () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })
    noReadStates()

    renderComponent()

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
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
    noReadStates()

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
    noReadStates()

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
    readStatesFor(["1", "2"], [])

    renderComponent()

    expect(screen.getByText("review.progress")).toBeTruthy()
  })

  test("starts at the first unread note when read states are settled", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
          { id: "3", obsidianUrl: "obsidian://note-3", title: "Note 3" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })
    readStatesFor(["1", "2", "3"], ["1", "2"])

    renderComponent()

    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://note-3")
  })

  test("renders obsidian link for the current note", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
        ],
      },
      error: undefined,
      isLoading: false,
    })
    useToggleNoteReadMock.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
    })
    readStatesFor(["1"], [])

    renderComponent()

    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://note-1")
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
    readStatesFor(["1", "2"], [])

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(mutateMock).toHaveBeenCalled()
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
    readStatesFor(["1"], [])

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(screen.getByText("review.allCaughtUp")).toBeTruthy()
  })

  test("passes read notes to ReadNotesMobileTrigger", () => {
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
    readStatesFor(["1", "2"], ["1"])

    renderComponent()

    expect(screen.getByText("1")).toBeTruthy()
  })

  test("does not render ReadNotesMobileTrigger content when no notes are read", () => {
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
    readStatesFor(["1", "2"], [])

    renderComponent()

    expect(screen.queryByRole("button", { name: "review.read" })).toBeNull()
  })

  test("keeps total count unchanged after marking a note as read", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
          { id: "3", obsidianUrl: "obsidian://note-3", title: "Note 3" },
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
    readStatesFor(["1", "2", "3"], [])

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(screen.getByText("review.progress")).toBeTruthy()
  })
})
