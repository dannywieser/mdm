import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"

import { Header } from "./Header"

vi.mock("mdm-util", () => ({
  formatDate: () => "2026-06-01",
}))

vi.mock("../PaletteSelector/PaletteSelector", () => ({
  PaletteSelector: () => <div data-testid="palette-selector" />,
}))

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("../../hooks/useViewsQuery/useViewsQuery", () => ({
  useViewsQuery: () => ({
    data: {
      views: [
        { id: "daily", name: "daily review" },
        { id: "downtime-active", name: "active downtime" },
      ],
    },
  }),
}))

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
  test("renders app name and formatted date", () => {
    renderAt("/")

    expect(screen.getByText("app.name")).toBeTruthy()
    expect(screen.getByText("2026-06-01")).toBeTruthy()
    expect(screen.getByTestId("palette-selector")).toBeTruthy()
  })

  test("renders stats icon link", () => {
    renderAt("/")

    expect(screen.getByRole("link", { name: /stats/i })).toBeTruthy()
  })

  test("shows app name as current breadcrumb on home route", () => {
    renderAt("/")

    const appNameEl = screen.getByText("app.name")
    expect(appNameEl).toBeTruthy()
    expect(appNameEl.getAttribute("aria-current")).toBe("page")
  })

  test("shows app name as a link and view name as current breadcrumb on notes route", () => {
    renderAt("/notes/daily")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    expect(screen.getByText("daily review")).toBeTruthy()
  })

  test("shows correct view name for different views", () => {
    renderAt("/notes/downtime-active")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    expect(screen.getByText("active downtime")).toBeTruthy()
  })

  test("shows app name as a link and Stats as current breadcrumb on stats route", () => {
    renderAt("/stats")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    expect(screen.getByText("header.stats")).toBeTruthy()
  })

  test("shows app name as a link and habit id as current breadcrumb on habit route", () => {
    renderAt("/tracking/drinking")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    expect(screen.getByText("drinking")).toBeTruthy()
  })

  test("shows app name as a link and colors as current breadcrumb on colors route", () => {
    renderAt("/colors")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    expect(screen.getByText("colors")).toBeTruthy()
  })

  test("shows close button instead of date/stats/palette on colors route", () => {
    renderAt("/colors")

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
    expect(screen.queryByText("2026-06-01")).toBeNull()
    expect(screen.queryByTestId("palette-selector")).toBeNull()
  })

  test("shows close button instead of date/stats/palette on stats route", () => {
    renderAt("/stats")

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
    expect(screen.queryByText("2026-06-01")).toBeNull()
    expect(screen.queryByTestId("palette-selector")).toBeNull()
  })
})
