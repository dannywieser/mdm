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

vi.mock("../../hooks/useStatsQuery/useStatsQuery", () => ({
  useStatsQuery: () => ({
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
          <Route path="/notes/:view" element={<Header />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("Header", () => {
  test("renders app name and formatted date", () => {
    renderAt("/")

    expect(screen.getByText("mdm")).toBeTruthy()
    expect(screen.getByText("2026-06-01")).toBeTruthy()
    expect(screen.getByTestId("palette-selector")).toBeTruthy()
  })

  test("shows app name as current breadcrumb on home route", () => {
    renderAt("/")

    const mdmEl = screen.getByText("mdm")
    expect(mdmEl).toBeTruthy()
    expect(mdmEl.getAttribute("aria-current")).toBe("page")
  })

  test("shows mdm as a link and view name as current breadcrumb on notes route", () => {
    renderAt("/notes/daily")

    expect(screen.getByRole("link", { name: "mdm" })).toBeTruthy()
    expect(screen.getByText("daily review")).toBeTruthy()
  })

  test("shows correct view name for different views", () => {
    renderAt("/notes/downtime-active")

    expect(screen.getByRole("link", { name: "mdm" })).toBeTruthy()
    expect(screen.getByText("active downtime")).toBeTruthy()
  })
})
