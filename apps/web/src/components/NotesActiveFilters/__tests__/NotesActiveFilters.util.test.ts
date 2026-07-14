import { describe, expect, test } from "vitest"

import { buildActiveFilterChips } from "../NotesActiveFilters.util"

describe("buildActiveFilterChips", () => {
  test("returns an empty list when nothing is selected", () => {
    expect(buildActiveFilterChips([], {})).toEqual([])
  })

  test("builds a chip per selected year", () => {
    expect(buildActiveFilterChips([2024, 2023], {})).toEqual([
      { label: "2024", paramKey: "year", value: "2024" },
      { label: "2023", paramKey: "year", value: "2023" },
    ])
  })

  test("builds a chip per selected frontmatter value, labeled with its key", () => {
    expect(buildActiveFilterChips([], { genre: ["fiction", "essays"] })).toEqual([
      { label: "genre: fiction", paramKey: "fm.genre", value: "fiction" },
      { label: "genre: essays", paramKey: "fm.genre", value: "essays" },
    ])
  })

  test("ignores frontmatter keys with no selected values", () => {
    expect(buildActiveFilterChips([], { genre: [] })).toEqual([])
  })

  test("combines year and frontmatter chips", () => {
    expect(buildActiveFilterChips([2024], { status: ["done"] })).toEqual([
      { label: "2024", paramKey: "year", value: "2024" },
      { label: "status: done", paramKey: "fm.status", value: "done" },
    ])
  })
})
