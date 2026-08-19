import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import type { Note } from "markdown"
import { MemoryRouter } from "react-router-dom"
import type { ViewSummary } from "services"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { HomeViewPreviewCard } from "../HomeViewPreviewCard"
import { selectPreviewNotes } from "../HomeViewPreviewCard.util"

const useNotesQueryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: (params: unknown) => useNotesQueryMock(params),
  }
})

vi.mock("../HomeViewPreviewCard.util", () => ({
  selectPreviewNotes: vi.fn(),
}))

vi.mock("../../NoteCoverGrid", () => ({
  NoteCoverGrid: ({ notes, variant }: { notes: Note[]; variant?: string }) => (
    <div data-testid="cover-grid" data-variant={variant}>
      {notes.map(({ id }) => id).join(",")}
    </div>
  ),
}))

const view: ViewSummary = {
  component: "NotesGallery",
  count: 12,
  dashboardPreview: true,
  id: "downtime",
  name: "downtime",
  noteIds: ["1", "2"],
}

const renderCard = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <HomeViewPreviewCard view={view} />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("HomeViewPreviewCard", () => {
  test("renders the notes chosen by selectPreviewNotes in a compact cover grid", () => {
    const notes = [{ id: "1" }, { id: "2" }] as Note[]
    useNotesQueryMock.mockReturnValue({ data: { notes } })
    vi.mocked(selectPreviewNotes).mockReturnValue(notes)

    renderCard()

    const grid = screen.getByTestId("cover-grid")
    expect(vi.mocked(selectPreviewNotes)).toHaveBeenCalledWith(notes)
    expect(grid.textContent).toBe("1,2")
    expect(grid.getAttribute("data-variant")).toBe("compact")
  })

  test("requests the view's notes without content", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] } })
    vi.mocked(selectPreviewNotes).mockReturnValue([{ id: "1" }] as Note[])

    renderCard()

    expect(useNotesQueryMock).toHaveBeenCalledWith({
      includeContent: false,
      view: "downtime",
    })
  })

  test("links to the view and shows its name and count", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] } })
    vi.mocked(selectPreviewNotes).mockReturnValue([{ id: "1" }] as Note[])

    renderCard()

    expect(screen.getByText("downtime")).toBeTruthy()
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByRole("link").getAttribute("href")).toBe("/notes/downtime")
  })

  test("renders nothing when no note in the view has an image", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] } })
    vi.mocked(selectPreviewNotes).mockReturnValue([])

    const { container } = renderCard()

    expect(container.firstChild).toBeNull()
  })
})
