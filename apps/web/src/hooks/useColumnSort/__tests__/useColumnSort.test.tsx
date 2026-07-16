import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { useColumnSort } from "../useColumnSort"

const TestComponent = ({ storageKey }: { storageKey: string }) => {
  const { sortKey, direction, toggleSort } = useColumnSort({
    storageKey,
    defaultSortKey: "title",
  })

  return (
    <div>
      <span data-testid="sort-state">{`${sortKey}:${direction}`}</span>
      <button
        onClick={() => {
          toggleSort("folder")
        }}
      >
        sort by folder
      </button>
      <button
        onClick={() => {
          toggleSort("title")
        }}
      >
        sort by title
      </button>
    </div>
  )
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe("useColumnSort", () => {
  test("starts with the default sort key ascending", () => {
    render(<TestComponent storageKey="mdm.sort.books" />)

    expect(screen.getByTestId("sort-state").textContent).toBe("title:asc")
  })

  test("switches to a new column ascending, then toggles direction on repeat clicks", () => {
    render(<TestComponent storageKey="mdm.sort.books" />)

    fireEvent.click(screen.getByText("sort by folder"))
    expect(screen.getByTestId("sort-state").textContent).toBe("folder:asc")

    fireEvent.click(screen.getByText("sort by folder"))
    expect(screen.getByTestId("sort-state").textContent).toBe("folder:desc")

    fireEvent.click(screen.getByText("sort by title"))
    expect(screen.getByTestId("sort-state").textContent).toBe("title:asc")
  })

  test("persists the last sort to local storage keyed by the storage key", () => {
    render(<TestComponent storageKey="mdm.sort.books" />)

    fireEvent.click(screen.getByText("sort by folder"))
    fireEvent.click(screen.getByText("sort by folder"))

    expect(window.localStorage.getItem("mdm.sort.books")).toBe(
      JSON.stringify({ sortKey: "folder", direction: "desc" }),
    )
  })

  test("restores a previously saved sort for a given storage key", () => {
    window.localStorage.setItem(
      "mdm.sort.movies",
      JSON.stringify({ sortKey: "frontmatter.genre", direction: "desc" }),
    )

    render(<TestComponent storageKey="mdm.sort.movies" />)

    expect(screen.getByTestId("sort-state").textContent).toBe("frontmatter.genre:desc")
  })
})
