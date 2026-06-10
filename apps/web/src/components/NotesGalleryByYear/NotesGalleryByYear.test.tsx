import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

const useNotesQueryMock = vi.fn()

vi.mock("../../hooks/useNotesQuery/useNotesQuery", () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("../LoadingScreen/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}))

vi.mock("../AppError/AppError", () => ({
  AppError: ({ message }: { message: string }) => <div data-testid="app-error">{message}</div>,
}))

vi.mock("../NoteBadges/NoteBadges", () => ({
  NoteBadges: () => <div data-testid="note-badges" />,
}))

import { NotesGalleryByYear } from "./NotesGalleryByYear"

const note = (id: string, title: string, createdDate: string | null, modifiedDate = createdDate ?? "2020-01-01T00:00:00.000Z") => ({
  id,
  title,
  obsidianUrl: `obsidian://open?vault=v&file=${id}`,
  frontmatter: { cover: "https://example.com/cover.jpg" },
  createdDate,
  modifiedDate,
})

const renderComponent = (props: Parameters<typeof NotesGalleryByYear>[0] = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <Routes>
          <Route path="/notes/:view" element={<NotesGalleryByYear {...props} />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesGalleryByYear", () => {
  test("renders the loading screen while fetching", () => {
    useNotesQueryMock.mockReturnValue({ data: undefined, error: undefined, isLoading: true })

    renderComponent()

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })

  test("renders an error state", () => {
    useNotesQueryMock.mockReturnValue({ data: undefined, error: new Error("Request failed"), isLoading: false })

    renderComponent()

    expect(screen.getByTestId("app-error")).toBeTruthy()
  })

  test("groups notes by year, most recent first", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          note("1", "2023 Note", "2023-01-15T00:00:00.000Z"),
          note("2", "2024 Note", "2024-03-10T00:00:00.000Z"),
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderComponent()

    const headings = screen.getAllByRole("heading").map((heading) => heading.textContent)
    expect(headings).toEqual(["2024", "2023"])
    expect(screen.getByText("2023 Note")).toBeTruthy()
    expect(screen.getByText("2024 Note")).toBeTruthy()
  })

  test("falls back to modifiedDate when createdDate is missing", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [note("1", "Undated Note", null, "2022-06-01T00:00:00.000Z")],
      },
      error: undefined,
      isLoading: false,
    })

    renderComponent()

    expect(screen.getByRole("heading", { name: "2022" })).toBeTruthy()
    expect(screen.getByText("Undated Note")).toBeTruthy()
  })

  test("filters to the selected year", () => {
    useNotesQueryMock.mockReturnValue({
      data: {
        notes: [
          note("1", "2023 Note", "2023-01-15T00:00:00.000Z"),
          note("2", "2024 Note", "2024-03-10T00:00:00.000Z"),
        ],
      },
      error: undefined,
      isLoading: false,
    })

    renderComponent()

    fireEvent.change(screen.getByTestId("year-filter"), { target: { value: "2023" } })

    expect(screen.getByText("2023 Note")).toBeTruthy()
    expect(screen.queryByText("2024 Note")).toBeNull()
  })
})
