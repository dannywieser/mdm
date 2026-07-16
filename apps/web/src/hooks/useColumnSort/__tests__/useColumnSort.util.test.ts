import { afterEach, describe, expect, test, vi } from "vitest"

import { getNextSortState, readStoredSort, writeStoredSort } from "../useColumnSort.util"

afterEach(() => {
  vi.unstubAllGlobals()
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
  })
})

describe("writeStoredSort", () => {
  test("writes the sort state to local storage", () => {
    writeStoredSort("mdm.sort.books", { sortKey: "folder", direction: "desc" })

    expect(window.localStorage.getItem("mdm.sort.books")).toBe(
      JSON.stringify({ sortKey: "folder", direction: "desc" }),
    )
  })

  test("does not throw when localStorage.setItem throws", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError")
    })

    expect(() => {
      writeStoredSort("mdm.sort.books", { sortKey: "folder", direction: "desc" })
    }).not.toThrow()

    setItemSpy.mockRestore()
  })

  test("does not throw when window is undefined", () => {
    vi.stubGlobal("window", undefined)

    expect(() => {
      writeStoredSort("mdm.sort.books", { sortKey: "folder", direction: "desc" })
    }).not.toThrow()
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
