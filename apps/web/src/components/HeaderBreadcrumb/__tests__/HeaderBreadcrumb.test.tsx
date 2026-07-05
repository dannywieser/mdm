import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../../theme/system"
import { HeaderBreadcrumb } from "../HeaderBreadcrumb"

vi.mock("../../../i18n", () => ({
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
          { id: "books", name: "books", component: "NotesGallery" },
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
          <Route path="/" element={<HeaderBreadcrumb />} />
          <Route path="/tracking/:habitId" element={<HeaderBreadcrumb />} />
          <Route path="/notes/:view" element={<HeaderBreadcrumb />} />
          <Route path="/stats" element={<HeaderBreadcrumb />} />
          <Route path="/colors" element={<HeaderBreadcrumb />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("HeaderBreadcrumb", () => {
  test("shows app name as current page on home route", () => {
    renderAt("/")

    const appNameEl = screen.getByText("app.name")
    expect(appNameEl).toBeTruthy()
    expect(appNameEl.getAttribute("aria-current")).toBe("page")
    expect(appNameEl.closest("a")).toBeNull()
  })

  test("shows app name as link and stats label as current page on stats route", () => {
    renderAt("/stats")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    const current = screen.getByText("header.stats")
    expect(current.getAttribute("aria-current")).toBe("page")
  })

  test("shows app name as link and colors label as current page on colors route", () => {
    renderAt("/colors")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    const current = screen.getByText("header.colors")
    expect(current.getAttribute("aria-current")).toBe("page")
  })

  test("shows app name as link and view name as current page on notes route", () => {
    renderAt("/notes/daily")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    const current = screen.getByText("daily review")
    expect(current.getAttribute("aria-current")).toBe("page")
  })

  test("shows correct view name for different views", () => {
    renderAt("/notes/books")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    expect(screen.getByText("books")).toBeTruthy()
  })

  test("shows app name as link and habit id as current page on tracking route", () => {
    renderAt("/tracking/drinking")

    expect(screen.getByRole("link", { name: "app.name" })).toBeTruthy()
    const current = screen.getByText("drinking")
    expect(current.getAttribute("aria-current")).toBe("page")
  })
})
