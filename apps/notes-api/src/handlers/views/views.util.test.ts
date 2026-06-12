import type { ScannedNote } from "../notes/notes.types"

import { applyViewFilter } from "../notes/filters/notes.filters"
import { buildViews } from "./views.util"

vi.mock("../notes/filters/notes.filters", () => ({
  applyViewFilter: vi.fn(),
}))

const applyViewFilterMock = vi.mocked(applyViewFilter)

const createNote = (overrides: Partial<ScannedNote> & { id: string }): ScannedNote => ({
  basename: "note.md",
  createdDate: "2026-06-01T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: "/notes/note.md",
  fullText: "",
  modifiedDate: "2026-06-01T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=note",
  title: "note",
  titleOrBodyDates: [],
  ...overrides,
})

describe("views util", () => {
  describe("buildViews", () => {
    test("returns view metadata, counts, and matched note ids per configured view", () => {
      const noteA = createNote({ id: "a" })
      const noteB = createNote({ id: "b" })
      const notes = [noteA, noteB]
      const views = [
        {
          badges: ["folder", "frontmatter.type"],
          component: "NotesList",
          filters: [{ "frontmatter.type": "book" }],
          id: "books",
          name: "Books",
        },
        {
          component: "NotesReview",
          filters: [{ "frontmatter.type": "game" }],
          id: "games",
          name: "Games",
        },
      ]
      const context = { dateFormats: [], timezone: "UTC" }

      applyViewFilterMock
        .mockReturnValueOnce([noteA, noteB])
        .mockReturnValueOnce([])

      const result = buildViews(notes, views, context)

      expect(result).toEqual([
        {
          badges: ["folder", "frontmatter.type"],
          component: "NotesList",
          count: 2,
          id: "books",
          name: "Books",
          noteIds: ["a", "b"],
        },
        {
          component: "NotesReview",
          count: 0,
          id: "games",
          name: "Games",
          noteIds: [],
        },
      ])
      expect(applyViewFilterMock).toHaveBeenCalledWith(notes, views, "books", context)
      expect(applyViewFilterMock).toHaveBeenCalledWith(notes, views, "games", context)
    })

    test("returns an empty array when there are no views", () => {
      const notes = [createNote({ id: "a" })]

      expect(buildViews(notes, [], { dateFormats: [], timezone: "UTC" })).toEqual([])
      expect(applyViewFilterMock).not.toHaveBeenCalled()
    })
  })
})
