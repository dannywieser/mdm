import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesFilterFacetGroup } from "../NotesFilterFacetGroup"

afterEach(cleanup)

const parseParamValuesMock = vi.fn()
const toggleSearchParamsMock = vi.fn()

vi.mock("../NotesFilterFacetGroup.util", () => ({
  parseParamValues: (...args: unknown[]) => parseParamValuesMock(...args),
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

const renderGroup = (options: string[]) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <NotesFilterFacetGroup label="Type" options={options} paramKey="fm.type" />
        <LocationDisplay />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesFilterFacetGroup", () => {
  test("renders nothing when there are no options", () => {
    parseParamValuesMock.mockReturnValue([])

    const { container } = renderGroup([])

    expect(container.textContent).toBe("")
  })

  test("renders a button per option and marks selected values as pressed", () => {
    parseParamValuesMock.mockReturnValue(["game"])

    renderGroup(["game", "cooking"])

    expect(screen.getByRole("button", { name: "game" }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByRole("button", { name: "cooking" }).getAttribute("aria-pressed")).toBe("false")
  })

  test("toggling an option delegates to toggleSearchParams and applies the result", () => {
    parseParamValuesMock.mockReturnValue([])
    toggleSearchParamsMock.mockReturnValue(new URLSearchParams("fm.type=game"))

    renderGroup(["game", "cooking"])

    fireEvent.click(screen.getByRole("button", { name: "game" }))

    expect(toggleSearchParamsMock).toHaveBeenCalledWith(expect.any(URLSearchParams), "fm.type", "game")
    expect(locationState.search).toBe("?fm.type=game")
  })

  test("removing the last selected value clears the param", () => {
    parseParamValuesMock.mockReturnValue(["game"])
    toggleSearchParamsMock.mockReturnValue(new URLSearchParams())

    renderGroup(["game"])

    fireEvent.click(screen.getByRole("button", { name: "game" }))

    expect(locationState.search).toBe("")
  })
})
