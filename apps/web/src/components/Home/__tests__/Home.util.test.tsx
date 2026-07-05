import { describe, expect, test } from "vitest"

import { getViewGridColumns, groupViewsByGroup } from "../Home.util"

describe("getViewGridColumns", () => {
  test("returns 1 for zero items", () => {
    expect(getViewGridColumns(0)).toBe(1)
  })

  test("returns 1 for one item", () => {
    expect(getViewGridColumns(1)).toBe(1)
  })

  test("returns 2 for two items", () => {
    expect(getViewGridColumns(2)).toBe(2)
  })

  test("returns 3 for three items", () => {
    expect(getViewGridColumns(3)).toBe(3)
  })

  test("returns 2 for four items", () => {
    expect(getViewGridColumns(4)).toBe(2)
  })

  test("returns 3 for five items", () => {
    expect(getViewGridColumns(5)).toBe(3)
  })

  test("returns 3 for nine items", () => {
    expect(getViewGridColumns(9)).toBe(3)
  })

  test("returns 4 for ten items", () => {
    expect(getViewGridColumns(10)).toBe(4)
  })
})

describe("groupViewsByGroup", () => {
  test("returns ungrouped views and grouped sections preserving order", () => {
    const grouped = groupViewsByGroup([
      { component: "NotesList", count: 1, id: "all", name: "All Notes", noteIds: ["a"] },
      { component: "NotesList", count: 2, group: "Library", id: "books", name: "Books", noteIds: ["b", "c"] },
      { component: "NotesList", count: 3, group: "Writing", id: "drafts", name: "Drafts", noteIds: ["d", "e", "f"] },
      { component: "NotesList", count: 4, group: "Library", id: "movies", name: "Movies", noteIds: ["g", "h", "i", "j"] },
    ])

    expect(grouped.ungroupedViews.map((view) => view.id)).toEqual(["all"])
    expect(grouped.groups).toEqual([
      {
        group: "Library",
        views: [
          { component: "NotesList", count: 2, group: "Library", id: "books", name: "Books", noteIds: ["b", "c"] },
          { component: "NotesList", count: 4, group: "Library", id: "movies", name: "Movies", noteIds: ["g", "h", "i", "j"] },
        ],
      },
      {
        group: "Writing",
        views: [
          { component: "NotesList", count: 3, group: "Writing", id: "drafts", name: "Drafts", noteIds: ["d", "e", "f"] },
        ],
      },
    ])
  })

  test("skips views with a count of zero", () => {
    const grouped = groupViewsByGroup([
      { component: "NotesList", count: 0, id: "empty", name: "Empty", noteIds: [] },
      { component: "NotesList", count: 0, group: "Library", id: "archived", name: "Archived", noteIds: [] },
      { component: "NotesList", count: 1, id: "all", name: "All Notes", noteIds: ["a"] },
    ])

    expect(grouped.ungroupedViews.map((view) => view.id)).toEqual(["all"])
    expect(grouped.groups).toEqual([])
  })

  test("treats whitespace-only group values as ungrouped", () => {
    const grouped = groupViewsByGroup([
      { component: "NotesList", count: 1, group: "   ", id: "all", name: "All Notes", noteIds: ["a"] },
    ])

    expect(grouped.ungroupedViews.map((view) => view.id)).toEqual(["all"])
    expect(grouped.groups).toEqual([])
  })
})
