import { describe, expect, test } from "vitest"
import type { Note } from "markdown"

import { getColumnLabel, resolveBadgeValues } from "./NotesSummaryTable.util"

const createNote = (frontmatter: Note["frontmatter"]): Note => ({
  basename: "book",
  dates: [],
  createdDate: "2024-01-01",
  frontmatter,
  folder: "books",
  fullText: "",
  content: { type: "root" },
  id: "1",
  modifiedDate: "2024-01-02",
  obsidianUrl: "obsidian://open?vault=v&file=book",
  title: "Book",
})

describe("resolveBadgeValues", () => {
  test("returns a single string value", () => {
    const note = createNote({ type: "book" })

    expect(resolveBadgeValues(note, "frontmatter.type")).toEqual(["book"])
  })

  test("returns string array values and filters invalid entries", () => {
    const note = createNote({ genre: ["fiction", "", "mystery"] })

    expect(resolveBadgeValues(note, "frontmatter.genre")).toEqual([
      "fiction",
      "mystery",
    ])
  })

  test("returns empty array for non-string values", () => {
    const note = createNote({ type: "book" })

    expect(resolveBadgeValues(note, "content")).toEqual([])
  })
})

describe("getColumnLabel", () => {
  test("returns final path segment", () => {
    expect(getColumnLabel("frontmatter.genre")).toBe("genre")
  })

  test("returns original badge for non-path badge", () => {
    expect(getColumnLabel("folder")).toBe("folder")
  })
})
