import type { ScannedNote } from "markdown"

import { scanHabitEntriesFromNotes } from "../habit-detail.bear"

const DATE_FORMATS = ["YYYY.MM.DD"]

const createNote = (overrides: Partial<ScannedNote> = {}): ScannedNote => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  folder: "",
  frontmatter: null,
  fullPath: "note",
  fullText: "",
  id: "note",
  modifiedDate: "2026-01-01T00:00:00.000Z",
  obsidianUrl: "bear://x-callback-url/open-note?id=note",
  tags: [],
  title: "note",
  ...overrides,
})

describe("scanHabitEntriesFromNotes", () => {
  test("strips surrounding quotes from frontmatter values before parsing the numeric value", () => {
    const note = createNote({
      frontmatter: { created: "2026.05.31", drinking: '"3"' },
      obsidianUrl: "bear://x-callback-url/open-note?id=a",
      title: "2026.05.31",
    })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([
      { date: "2026-05-31", value: 3, obsidianUrl: "bear://x-callback-url/open-note?id=a" },
    ])
  })

  test("parses unquoted numeric frontmatter values", () => {
    const note = createNote({
      frontmatter: { created: "2026.05.13", drinking: "5" },
      title: "2026.05.13",
    })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([{ date: "2026-05-13", value: 5, obsidianUrl: note.obsidianUrl }])
  })

  test("skips notes without frontmatter", () => {
    const note = createNote({ frontmatter: null })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("skips notes where the configured property is missing", () => {
    const note = createNote({ frontmatter: { topic: "drinking" } })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("skips notes where the configured property is below the minimum of 1", () => {
    const note = createNote({ frontmatter: { created: "2026.05.31", drinking: '"0"' } })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("accepts values above 10, for habits tracking unbounded quantities like a dollar amount", () => {
    const note = createNote({
      frontmatter: { created: "2026.05.31", spending: '"80"' },
      title: "2026.05.31",
    })

    const entries = scanHabitEntriesFromNotes([note], "spending", "created", DATE_FORMATS)

    expect(entries).toEqual([{ date: "2026-05-31", value: 80, obsidianUrl: note.obsidianUrl }])
  })

  test("skips notes whose date cannot be resolved from frontmatter or title", () => {
    const note = createNote({ frontmatter: { drinking: '"3"' }, title: "no-date" })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("derives the date from the title when frontmatter has no usable date", () => {
    const note = createNote({
      frontmatter: { drinking: '"3"' },
      title: "2026.05.31 (Sun)",
    })

    const entries = scanHabitEntriesFromNotes([note], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([{ date: "2026-05-31", value: 3, obsidianUrl: note.obsidianUrl }])
  })

  test("scans multiple notes independently", () => {
    const noteA = createNote({
      frontmatter: { created: "2026.01.01", drinking: "2" },
      id: "a",
      title: "2026.01.01",
    })
    const noteB = createNote({
      frontmatter: { created: "2026.01.02", drinking: "4" },
      id: "b",
      title: "2026.01.02",
    })

    const entries = scanHabitEntriesFromNotes([noteA, noteB], "drinking", "created", DATE_FORMATS)

    expect(entries).toEqual([
      { date: "2026-01-01", value: 2, obsidianUrl: noteA.obsidianUrl },
      { date: "2026-01-02", value: 4, obsidianUrl: noteB.obsidianUrl },
    ])
  })
})
