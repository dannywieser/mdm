import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"
import { Header } from "./Header"

vi.mock("mdm-util", () => ({
  formatDate: () => "2026-06-01",
}))

vi.mock("../HeaderPaletteSelector", () => ({
  HeaderPaletteSelector: () => <div data-testid="palette-selector" />,
}))

vi.mock("../HeaderBreadcrumb", () => ({
  HeaderBreadcrumb: () => <div data-testid="header-breadcrumb" />,
}))

vi.mock("../HeaderStatsLink", () => ({
  HeaderStatsLink: () => <div data-testid="header-stats-link" />,
}))

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useViewsQuery: () => ({
      data: {
        views: [
          { id: "daily", name: "daily review" },
          { component: "NotesGallery", id: "books", name: "books" },
        ],
      },
    }),
  }
})

afterEach(() => {
  cleanup()
})

const renderAt = (path: string) =>
  render(
    <ChakraProvider value={defaultColorPaletteSystem}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/tracking/:habitId" element={<Header />} />
          <Route path="/notes/:view" element={<Header />} />
          <Route path="/stats" element={<Header />} />
          <Route path="/colors" element={<Header />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("Header", () => {
  test("renders breadcrumb, formatted date, stats link, and palette selector on home route", () => {
    renderAt("/")

    expect(screen.getByTestId("header-breadcrumb")).toBeTruthy()
    expect(screen.getByText("2026-06-01")).toBeTruthy()
    expect(screen.getByTestId("header-stats-link")).toBeTruthy()
    expect(screen.getByTestId("palette-selector")).toBeTruthy()
  })

  test("shows close button instead of date/stats/palette on stats route", () => {
    renderAt("/stats")

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
    expect(screen.queryByText("2026-06-01")).toBeNull()
    expect(screen.queryByTestId("header-stats-link")).toBeNull()
    expect(screen.queryByTestId("palette-selector")).toBeNull()
  })

  test("shows close button instead of date/stats/palette on colors route", () => {
    renderAt("/colors")

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
    expect(screen.queryByText("2026-06-01")).toBeNull()
    expect(screen.queryByTestId("header-stats-link")).toBeNull()
    expect(screen.queryByTestId("palette-selector")).toBeNull()
  })

  test("shows notes search input on a NotesGallery view route", () => {
    renderAt("/notes/books")

    expect(screen.getByRole("textbox", { name: "header.searchNotes" })).toBeTruthy()
  })

  test("hides notes search input on routes with a different view component", () => {
    renderAt("/notes/daily")

    expect(screen.queryByRole("textbox", { name: "header.searchNotes" })).toBeNull()
  })

  test("hides notes search input on the home route", () => {
    renderAt("/")

    expect(screen.queryByRole("textbox", { name: "header.searchNotes" })).toBeNull()
  })
})
