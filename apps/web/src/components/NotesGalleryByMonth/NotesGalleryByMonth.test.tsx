import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

const useNotesQueryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNotesQuery: () => useNotesQueryMock(),
  }
})

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("../AppError", () => ({
  AppError: ({ message }: { message: string }) => <div data-testid="app-error">{message}</div>,
}))

vi.mock("../NoteBadges", () => ({
  NoteBadges: () => <div data-testid="note-badges" />,
}))

import { NotesGalleryByMonth } from "./NotesGalleryByMonth"

const note = (id: string, title: string, createdDate: string | null, modifiedDate = createdDate ?? "2020-01-01T00:00:00.000Z") => ({
  id,
  title,
  obsidianUrl: `obsidian://open?vault=v&file=${id}`,
  frontmatter: { cover: "https://example.com/cover.jpg" },
  createdDate,
  modifiedDate,
})

const renderComponent = (props: Parameters<typeof NotesGalleryByMonth>[0] = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <Routes>
          <Route path="/notes/:view" element={<NotesGalleryByMonth {...props} />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesGalleryByMonth", () => {
  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({ data: { notes: [] }, error: new Error("Request failed") })

    renderComponent()

    expect(screen.getByTestId("app-error")).toBeTruthy()
  })

  test("groups notes by month for the given year", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          note("1", "January Note", "2024-01-15T00:00:00.000Z"),
          note("2", "March Note", "2024-03-10T00:00:00.000Z"),
          note("3", "Other Year Note", "2023-01-15T00:00:00.000Z"),
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderComponent({ year: 2024 })

    expect(screen.getByText("January Note")).toBeTruthy()
    expect(screen.getByText("March Note")).toBeTruthy()
    expect(screen.queryByText("Other Year Note")).toBeNull()
    expect(screen.getByText("January 2024")).toBeTruthy()
    expect(screen.getByText("March 2024")).toBeTruthy()
  })

  test("falls back to modifiedDate when createdDate is missing", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [note("1", "Undated Note", null, "2024-02-15T00:00:00.000Z")],
      },
      error: undefined,
      isLoading: false,
    })

    renderComponent({ year: 2024 })

    expect(screen.getByText("February 2024")).toBeTruthy()
    expect(screen.getByText("Undated Note")).toBeTruthy()
  })

  test("filters to the selected month", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          note("1", "January Note", "2024-01-15T00:00:00.000Z"),
          note("2", "March Note", "2024-03-10T00:00:00.000Z"),
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderComponent({ year: 2024 })

    fireEvent.change(screen.getByTestId("month-filter"), { target: { value: "3" } })

    expect(screen.queryByText("January Note")).toBeNull()
    expect(screen.getByText("March Note")).toBeTruthy()
  })
})
