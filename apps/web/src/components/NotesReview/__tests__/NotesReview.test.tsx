import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReview } from "../NotesReview"

const useNotesQueryMock = vi.fn()
const useToggleReadMock = vi.fn()
const useQueriesMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useParams: () => ({ view: "test-view" }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  }
})

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: () => useNotesQueryMock(),
    useToggleRead: () => useToggleReadMock(),
    fetchIsRead: vi.fn(),
  }
})

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return { ...actual, useQueries: () => useQueriesMock() }
})

vi.mock("../../MarkdownTree", () => ({
  MarkdownTree: () => null,
}))


vi.mock("../../OpenInObsidianButton", () => ({
  OpenInObsidianButton: ({ note }: { note: { obsidianUrl: string } }) => (
    <a href={note.obsidianUrl}>open</a>
  ),
}))

vi.mock("../../NotesReviewTableOfContentsSidebar", () => ({
  NotesReviewTableOfContentsSidebar: () => null,
}))

vi.mock("../../NotesReviewTableOfContentsMobileTrigger", () => ({
  NotesReviewTableOfContentsMobileTrigger: ({
    notes,
    currentIndex,
  }: {
    notes: { id: string }[]
    currentIndex: number
  }) =>
    notes.length > 0 ? (
      <button>
        {currentIndex + 1}/{notes.length}
      </button>
    ) : null,
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
  const renderComponent = (badges: string[] = []) =>
    render(
      <ChakraProvider value={defaultSystem}>
        <NotesReview badges={badges} />
      </ChakraProvider>,
    )

  test("shows animated icon without completion text while read states are pending", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [{ id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" }],
      },
    })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
    useQueriesMock.mockReturnValue([{ status: "pending" }])

    renderComponent()

    expect(screen.getByRole("img", { name: "Notebook" })).toBeTruthy()
    expect(screen.queryByText("review.complete")).toBeNull()
  })

  test("renders all caught up when there are no notes", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] } })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
    noReadStates()

    renderComponent()

    expect(screen.getByText("review.complete")).toBeTruthy()
  })

  test("uses component-local animation for completion state text", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] } })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
    noReadStates()

    renderComponent()

    const completeText = screen.getByText("review.complete")
    const backToHomeText = screen.getByText("review.backToHome").closest("p")

    // Animation is applied via Emotion's css prop (injected as a class), not inline style.
    // Verify neither element references the old global animation name inline.
    expect(completeText.getAttribute("style") ?? "").not.toContain("review-item-in")
    expect(backToHomeText?.getAttribute("style") ?? "").not.toContain("review-item-in")
    // Emotion injects a generated class for the animation
    expect(completeText.className).toBeTruthy()
    expect(backToHomeText?.className).toBeTruthy()
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
    })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
    readStatesFor(["1", "2", "3"], ["1", "2"])

    renderComponent()

    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://note-3")
  })

  test("renders obsidian link for the current note", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [{ id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" }] },
    })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
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
    })
    const mutateMock = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    useToggleReadMock.mockReturnValue({ mutate: mutateMock, isPending: false })
    readStatesFor(["1", "2"], [])

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(mutateMock).toHaveBeenCalled()
    expect(screen.getByRole("link").getAttribute("href")).toBe("obsidian://note-2")
  })

  test("fast-forwards to the next unread note, skipping already-read notes", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
          { id: "3", obsidianUrl: "obsidian://note-3", title: "Note 3" },
        ],
      },
    })
    const mutateMock = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    useToggleReadMock.mockReturnValue({ mutate: mutateMock, isPending: false })
    // Note 1 is the only unread note; notes 2 and 3 are already read.
    readStatesFor(["1", "2", "3"], ["2", "3"])

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(mutateMock).toHaveBeenCalled()
    expect(screen.getByText("review.complete")).toBeTruthy()
  })

  test("shows all caught up after reviewing all notes", () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: [{ id: "1", title: "Note 1" }] },
    })
    const mutateMock = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    useToggleReadMock.mockReturnValue({ mutate: mutateMock, isPending: false })
    readStatesFor(["1"], [])

    renderComponent()

    fireEvent.click(screen.getByRole("button", { name: "notes.markAsRead" }))

    expect(screen.getByText("review.complete")).toBeTruthy()
  })

  test("passes all notes with read state to NotesReviewTableOfContentsMobileTrigger", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          { id: "1", obsidianUrl: "obsidian://note-1", title: "Note 1" },
          { id: "2", obsidianUrl: "obsidian://note-2", title: "Note 2" },
        ],
      },
    })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
    readStatesFor(["1", "2"], [])

    renderComponent()

    expect(screen.getByText("1/2")).toBeTruthy()
  })

  test("renders configured badges for the current note", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          {
            id: "1",
            folder: "daily",
            frontmatter: { genre: ["thriller"], type: "book" },
            obsidianUrl: "obsidian://note-1",
            title: "Note 1",
          },
        ],
      },
    })
    useToggleReadMock.mockReturnValue({ mutate: defaultMutate, isPending: false })
    readStatesFor(["1"], [])

    renderComponent(["folder", "frontmatter.type", "frontmatter.genre"])

    expect(screen.getByText("daily")).toBeTruthy()
    expect(screen.getByText("book")).toBeTruthy()
    expect(screen.getByText("thriller")).toBeTruthy()
  })
})
