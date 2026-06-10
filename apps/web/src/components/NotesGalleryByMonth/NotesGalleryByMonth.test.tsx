import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
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

import { NotesGalleryByMonth } from "./NotesGalleryByMonth"

const note = (id: string, title: string, createdDate: string) => ({
  id,
  title,
  obsidianUrl: `obsidian://open?vault=v&file=${id}`,
  frontmatter: { cover: "https://example.com/cover.jpg" },
  createdDate,
})

const renderComponent = (props: Parameters<typeof NotesGalleryByMonth>[0] = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <NotesGalleryByMonth {...props} />
    </ChakraProvider>,
  )

describe("NotesGalleryByMonth", () => {
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
