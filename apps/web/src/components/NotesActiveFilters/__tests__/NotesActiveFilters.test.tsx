import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesActiveFilters } from "../NotesActiveFilters"

afterEach(cleanup)

const buildActiveFilterChipsMock = vi.fn()

vi.mock("../NotesActiveFilters.util", () => ({
  buildActiveFilterChips: (...args: unknown[]) => buildActiveFilterChipsMock(...args),
}))

const toggleSearchParamsMock = vi.fn()

vi.mock("../../NotesFilterFacetGroup/NotesFilterFacetGroup.util", () => ({
  toggleSearchParams: (...args: unknown[]) => toggleSearchParamsMock(...args),
}))

const locationState = { search: "" }

function LocationDisplay() {
  const location = useLocation()

  useEffect(() => {
    locationState.search = location.search
  }, [location.search])

  return null
}

const renderChips = (selectedYears: number[] = [], selectedFrontmatter: Record<string, string[]> = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books?year=2024"]}>
        <NotesActiveFilters selectedFrontmatter={selectedFrontmatter} selectedYears={selectedYears} />
        <LocationDisplay />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesActiveFilters", () => {
  test("renders nothing when there are no active filters", () => {
    buildActiveFilterChipsMock.mockReturnValue([])

    const { container } = renderChips()

    expect(container.textContent).toBe("")
  })

  test("passes the selections through to buildActiveFilterChips", () => {
    buildActiveFilterChipsMock.mockReturnValue([])

    renderChips([2024], { genre: ["fiction"] })

    expect(buildActiveFilterChipsMock).toHaveBeenCalledWith([2024], { genre: ["fiction"] })
  })

  test("renders a chip per active filter", () => {
    buildActiveFilterChipsMock.mockReturnValue([
      { label: "2024", paramKey: "year", value: "2024" },
      { label: "genre: fiction", paramKey: "fm.genre", value: "fiction" },
    ])

    renderChips()

    expect(screen.getAllByRole("button", { name: "gallery.removeFilter" })).toHaveLength(2)
    expect(screen.getByText("2024")).toBeTruthy()
    expect(screen.getByText("genre: fiction")).toBeTruthy()
  })

  test("clicking a chip removes that filter via toggleSearchParams", () => {
    buildActiveFilterChipsMock.mockReturnValue([
      { label: "2024", paramKey: "year", value: "2024" },
    ])
    toggleSearchParamsMock.mockReturnValue(new URLSearchParams())

    renderChips([2024])
    fireEvent.click(screen.getByRole("button", { name: "gallery.removeFilter" }))

    expect(toggleSearchParamsMock).toHaveBeenCalledWith(expect.any(URLSearchParams), "year", "2024")
    expect(locationState.search).toBe("")
  })
})
