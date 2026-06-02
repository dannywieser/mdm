import { getDateComponents } from "mdm-util"

import type { ScannedNote } from "../notes/notes.types"

import { applyViewFilter } from "../notes/filters/notes.filters"
import { buildViewCounts, countModifiedToday } from "./stats.util"

jest.mock("mdm-util", () => ({ getDateComponents: jest.fn() }))
jest.mock("../notes/filters/notes.filters", () => ({
  applyViewFilter: jest.fn(),
}))

const getDateComponentsMock = jest.mocked(getDateComponents)
const applyViewFilterMock = jest.mocked(applyViewFilter)

const createNote = (modifiedDate: string): ScannedNote => ({
  basename: "note.md",
  createdDate: "2026-06-01T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: "/notes/note.md",
  id: "note",
  modifiedDate,
  obsidianUrl: "obsidian://open?vault=vault&file=note",
  title: "note",
  titleOrBodyDates: [],
})

describe("stats util", () => {
  describe("countModifiedToday", () => {
    test("counts notes whose modifiedDate falls on today", () => {
      getDateComponentsMock
        .mockReturnValueOnce({ day: 1, month: 6, year: 2026 })
        .mockReturnValueOnce({ day: 1, month: 6, year: 2026 })
        .mockReturnValueOnce({ day: 1, month: 6, year: 2026 })
        .mockReturnValueOnce({ day: 31, month: 5, year: 2026 })

      const notes = [
        createNote("2026-06-01T10:00:00.000Z"),
        createNote("2026-06-01T14:00:00.000Z"),
        createNote("2026-05-31T10:00:00.000Z"),
      ]

      expect(countModifiedToday(notes, "UTC")).toBe(2)
    })

    test("returns zero when no notes were modified today", () => {
      getDateComponentsMock
        .mockReturnValueOnce({ day: 1, month: 6, year: 2026 })
        .mockReturnValueOnce({ day: 31, month: 5, year: 2026 })

      const notes = [createNote("2026-05-31T10:00:00.000Z")]

      expect(countModifiedToday(notes, "UTC")).toBe(0)
    })
  })

  describe("buildViewCounts", () => {
    test("returns a count per configured view", () => {
      const notes = [createNote("2026-06-01T10:00:00.000Z")]
      const views = [
        {
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
        .mockReturnValueOnce([notes[0]])
        .mockReturnValueOnce([])

      const result = buildViewCounts(notes, views, context)

      expect(result).toEqual([
        { component: "NotesList", count: 1, id: "books", name: "Books" },
        {
          component: "NotesReview",
          count: 0,
          id: "games",
          name: "Games",
        },
      ])
      expect(applyViewFilterMock).toHaveBeenCalledWith(
        notes,
        views,
        "books",
        context,
      )
      expect(applyViewFilterMock).toHaveBeenCalledWith(
        notes,
        views,
        "games",
        context,
      )
    })

    test("returns an empty array when there are no views", () => {
      const notes = [createNote("2026-06-01T10:00:00.000Z")]

      expect(
        buildViewCounts(notes, [], { dateFormats: [], timezone: "UTC" }),
      ).toEqual([])
      expect(applyViewFilterMock).not.toHaveBeenCalled()
    })
  })
})
