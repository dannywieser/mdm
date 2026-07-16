import { afterEach, describe, expect, test, vi } from "vitest"

import { getNextSortState, readStoredSort } from "../useColumnSort.util"

afterEach(() => {
  window.localStorage.clear()
})

describe("readStoredSort", () => {
  test("returns the default ascending state when nothing is stored", () => {
    expect(readStoredSort("mdm.sort.books", "title")).toEqual({
      sortKey: "title",
      direction: "asc",
    })
  })

  test("returns the stored state when it is valid", () => {
    window.localStorage.setItem(
      "mdm.sort.books",
      JSON.stringify({ sortKey: "frontmatter.genre", direction: "desc" }),
    )

    expect(readStoredSort("mdm.sort.books", "title")).toEqual({
      sortKey: "frontmatter.genre",
      direction: "desc",
    })
  })

  test("falls back to the default when the stored value is malformed", () => {
    window.localStorage.setItem("mdm.sort.books", "not json")

    expect(readStoredSort("mdm.sort.books", "title")).toEqual({
      sortKey: "title",
      direction: "asc",
    })
  })

  test("falls back to the default when the stored direction is invalid", () => {
    window.localStorage.setItem(
      "mdm.sort.books",
      JSON.stringify({ sortKey: "folder", direction: "sideways" }),
    )

    expect(readStoredSort("mdm.sort.books", "title")).toEqual({
      sortKey: "title",
      direction: "asc",
    })
  })

  test("falls back to the default when localStorage.getItem throws", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })

    expect(readStoredSort("mdm.sort.books", "title")).toEqual({
      sortKey: "title",
      direction: "asc",
    })

    getItemSpy.mockRestore()
  })

  test("returns the default when window is undefined", () => {
    vi.stubGlobal("window", undefined)

    expect(readStoredSort("mdm.sort.books", "title")).toEqual({
      sortKey: "title",
      direction: "asc",
    })

    vi.unstubAllGlobals()
  })
})

describe("getNextSortState", () => {
  test("sorts a new column ascending", () => {
    expect(getNextSortState({ sortKey: "title", direction: "desc" }, "folder")).toEqual({
      sortKey: "folder",
      direction: "asc",
    })
  })

  test("toggles direction when sorting the same column again", () => {
    expect(getNextSortState({ sortKey: "title", direction: "asc" }, "title")).toEqual({
      sortKey: "title",
      direction: "desc",
    })

    expect(getNextSortState({ sortKey: "title", direction: "desc" }, "title")).toEqual({
      sortKey: "title",
      direction: "asc",
    })
  })
})
