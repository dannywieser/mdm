import { describe, expect, test } from "vitest"
import type { Note } from "markdown"

import { getColumnLabel, getSortValue, resolveBadgeValues, sortNotes } from "../NotesSummaryTable.util"

const createNote = (
  frontmatter: Note["frontmatter"],
  overrides: Partial<Note> = {},
): Note => ({
  basename: "book",
  dates: [],
  createdDate: "2024-01-01",
  frontmatter,
  folder: "books",
  fullPath: "/notes/books/book.md",
  fullText: "",
  content: { type: "root" },
  id: "1",
  modifiedDate: "2024-01-02",
  obsidianUrl: "obsidian://open?vault=v&file=book",
  title: "Book",
  ...overrides,
})

describe("resolveBadgeValues", () => {
  test("returns a single string value", () => {
    const note = createNote({ type: "book" })

    expect(resolveBadgeValues(note, "frontmatter.type")).toEqual(["book"])
  })

  test("returns string array values and filters invalid entries", () => {
    const note = createNote({ genre: ["fiction", "", "mystery"] })

    expect(resolveBadgeValues(note, "frontmatter.genre")).toEqual(["fiction", "mystery"])
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

describe("getSortValue", () => {
  test("returns the note title for the title sort key", () => {
    const note = createNote({ type: "book" }, { title: "Zebra" })

    expect(getSortValue(note, "title")).toBe("Zebra")
  })

  test("returns joined badge values for other sort keys", () => {
    const note = createNote({ genre: ["fiction", "mystery"] })

    expect(getSortValue(note, "frontmatter.genre")).toBe("fiction, mystery")
  })
})

describe("sortNotes", () => {
  test("sorts notes by title ascending and descending", () => {
    const notes = [
      createNote({}, { id: "1", title: "Zebra" }),
      createNote({}, { id: "2", title: "Apple" }),
    ]

    expect(sortNotes(notes, "title", "asc").map((note) => note.title)).toEqual([
      "Apple",
      "Zebra",
    ])
    expect(sortNotes(notes, "title", "desc").map((note) => note.title)).toEqual([
      "Zebra",
      "Apple",
    ])
  })

  test("sorts notes by a badge column", () => {
    const notes = [
      createNote({ type: "novel" }, { id: "1", title: "One" }),
      createNote({ type: "biography" }, { id: "2", title: "Two" }),
    ]

    expect(
      sortNotes(notes, "frontmatter.type", "asc").map((note) => note.title),
    ).toEqual(["Two", "One"])
  })

  test("does not mutate the original notes array", () => {
    const notes = [
      createNote({}, { id: "1", title: "Zebra" }),
      createNote({}, { id: "2", title: "Apple" }),
    ]

    sortNotes(notes, "title", "asc")

    expect(notes.map((note) => note.title)).toEqual(["Zebra", "Apple"])
  })
})
