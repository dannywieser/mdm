import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"

import type { ScannedNote } from "../notes/notes.types"

import { applyViewFilter } from "../notes/filters/notes.filters"
import { buildViews } from "./views.util"

vi.mock("app-config", () => ({
  resolveNotesConfig: vi.fn(),
}))

vi.mock("../notes/filters/notes.filters", () => ({
  applyViewFilter: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const applyViewFilterMock = vi.mocked(applyViewFilter)

const defaultConfig = createMockNotesConfig()

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
  dates: [],
  ...overrides,
})

describe("views util", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(defaultConfig)
  })

  describe("buildViews", () => {
    test("returns view metadata, counts, and matched note ids per configured view", async () => {
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

      resolveNotesConfigMock.mockResolvedValue({ ...defaultConfig, views })

      applyViewFilterMock
        .mockResolvedValueOnce([noteA, noteB])
        .mockResolvedValueOnce([])

      const result = await buildViews(notes)

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
      expect(applyViewFilterMock).toHaveBeenCalledWith(notes, "books")
      expect(applyViewFilterMock).toHaveBeenCalledWith(notes, "games")
    })

    test("returns an empty array when there are no views", async () => {
      const notes = [createNote({ id: "a" })]

      expect(await buildViews(notes)).toEqual([])
      expect(applyViewFilterMock).not.toHaveBeenCalled()
    })
  })
})
