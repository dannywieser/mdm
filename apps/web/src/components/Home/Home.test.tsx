import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { Home } from "./Home"

const useStatsQueryMock = vi.fn()
const useHabitsQueryMock = vi.fn()
const groupViewsByGroupMock = vi.fn()
const getViewGridColumnsMock = vi.fn()

vi.mock("../../hooks/useStatsQuery/useStatsQuery", () => ({
  useStatsQuery: () => useStatsQueryMock(),
}))

vi.mock("../../hooks/useHabitsQuery/useHabitsQuery", () => ({
  useHabitsQuery: () => useHabitsQueryMock(),
}))

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("./Home.util", () => ({
  groupViewsByGroup: (...args: unknown[]) => groupViewsByGroupMock(...args),
  getViewGridColumns: (...args: unknown[]) => getViewGridColumnsMock(...args),
}))

describe("Home", () => {
  test("renders view links with name and count", () => {
    useStatsQueryMock.mockReturnValue({
      isLoading: false,
      data: {
        views: [
          { component: "NotesList", count: 4, id: "books", name: "Books" },
        ],
      },
    })
    useHabitsQueryMock.mockReturnValue({ data: [] })
    getViewGridColumnsMock.mockReturnValue(1)
    groupViewsByGroupMock.mockReturnValue({
      groups: [],
      ungroupedViews: [
        { component: "NotesList", count: 4, id: "books", name: "Books" },
      ],
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByText("Books")).toBeTruthy()
    expect(screen.getByText("4")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /books/i }).getAttribute("href"),
    ).toBe("/notes/books")
  })

  test("renders habit cards linking to the habit detail route", () => {
    useStatsQueryMock.mockReturnValue({
      isLoading: false,
      data: { views: [] },
    })
    getViewGridColumnsMock.mockReturnValue(1)
    groupViewsByGroupMock.mockReturnValue({ groups: [], ungroupedViews: [] })
    useHabitsQueryMock.mockReturnValue({
      data: [
        {
          habitId: "drinking",
          habitName: "drinking",
          habitScore: 38,
          mode: "do-less",
          streak: 2,
          targetScore: 100,
          windowEntries: 4,
        },
      ],
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByText("habit.modeDoLess: drinking")).toBeTruthy()
    expect(screen.getByText("38")).toBeTruthy()
    expect(screen.getByText("home.habits")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: /drinking/i }).getAttribute("href"),
    ).toBe("/tracking/drinking")
  })

  test("renders grouped views with section heading", () => {
    useStatsQueryMock.mockReturnValue({
      isLoading: false,
      data: {
        views: [
          { component: "NotesList", count: 4, group: "Library", id: "books", name: "Books" },
          { component: "NotesList", count: 3, group: "Library", id: "movies", name: "Movies" },
        ],
      },
    })
    useHabitsQueryMock.mockReturnValue({ data: [] })
    getViewGridColumnsMock.mockReturnValue(1)
    groupViewsByGroupMock.mockReturnValue({
      groups: [
        {
          group: "Library",
          views: [
            { component: "NotesList", count: 4, group: "Library", id: "books", name: "Books" },
            { component: "NotesList", count: 3, group: "Library", id: "movies", name: "Movies" },
          ],
        },
      ],
      ungroupedViews: [],
    })

    const { container: groupedContainer } = render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ChakraProvider>,
    )

    const libraryHeading = screen.getByRole("heading", { name: "Library" })
    const librarySection = libraryHeading.parentElement as HTMLElement

    expect(libraryHeading).toBeTruthy()
    expect(within(librarySection).getByRole("separator")).toBeTruthy()
    expect(within(groupedContainer).getByRole("link", { name: /books/i })).toBeTruthy()
  })

  test("does not render section heading when views are ungrouped", () => {
    useStatsQueryMock.mockReturnValue({
      isLoading: false,
      data: {
        views: [
          { component: "NotesList", count: 4, id: "books", name: "Books" },
        ],
      },
    })
    useHabitsQueryMock.mockReturnValue({ data: [] })
    getViewGridColumnsMock.mockReturnValue(1)
    groupViewsByGroupMock.mockReturnValue({
      groups: [],
      ungroupedViews: [
        { component: "NotesList", count: 4, id: "books", name: "Books" },
      ],
    })

    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(within(container).queryByRole("separator")).toBeNull()
  })
})
