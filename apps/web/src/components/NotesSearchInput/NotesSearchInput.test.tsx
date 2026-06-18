import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { NotesSearchInput } from "./NotesSearchInput"
import { SEARCH_DEBOUNCE_MS } from "./NotesSearchInput.constants"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const locationState = { search: "" }

const renderAt = (path: string) => {
  locationState.search = path.includes("?") ? path.slice(path.indexOf("?")) : ""

  return render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/notes/:view"
            element={
              <>
                <NotesSearchInput />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )
}

function LocationDisplay() {
  const location = useLocation()

  useEffect(() => {
    locationState.search = location.search
  }, [location.search])

  return null
}

describe("NotesSearchInput", () => {
  test("renders an empty input by default", () => {
    renderAt("/notes/books")

    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "header.searchNotes" })
    expect(input.value).toBe("")
  })

  test("initializes from the q search param", () => {
    renderAt("/notes/books?q=game")

    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "header.searchNotes" })
    expect(input.value).toBe("game")
  })

  test("updates the search input value when typing", () => {
    renderAt("/notes/books")

    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "header.searchNotes" })
    fireEvent.change(input, { target: { value: "game" } })

    expect(input.value).toBe("game")
  })

  test("does not update the URL until the debounce delay elapses", () => {
    renderAt("/notes/books")

    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "header.searchNotes" })
    fireEvent.change(input, { target: { value: "game" } })

    expect(locationState.search).toBe("")

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })

    expect(locationState.search).toBe("?q=game")
  })

  test("only applies the latest value after rapid typing", () => {
    renderAt("/notes/books")

    const input = screen.getByRole("textbox", { name: "header.searchNotes" })
    fireEvent.change(input, { target: { value: "g" } })
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS / 2)
    })
    fireEvent.change(input, { target: { value: "game" } })
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })

    expect(locationState.search).toBe("?q=game")
  })
})
