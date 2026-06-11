import { getDateComponents } from "mdm-util"

import type { ScannedNote } from "../notes/notes.types"

import {
  buildFolderBreakdown,
  buildNotesCreated,
  buildNotesPerDay,
  buildTrends,
  countFolders,
  countModifiedToday,
  countNotesWithoutCreatedDate,
} from "./stats.util"

vi.mock("mdm-util", () => ({ getDateComponents: vi.fn() }))

const getDateComponentsMock = vi.mocked(getDateComponents)

const createNote = (
  overrides: Partial<ScannedNote> & { modifiedDate: string },
): ScannedNote => ({
  basename: "note.md",
  createdDate: "2026-06-01T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: "/notes/note.md",
  id: "note",
  obsidianUrl: "obsidian://open?vault=vault&file=note",
  title: "note",
  titleOrBodyDates: [],
  ...overrides,
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
        createNote({ modifiedDate: "2026-06-01T10:00:00.000Z" }),
        createNote({ modifiedDate: "2026-06-01T14:00:00.000Z" }),
        createNote({ modifiedDate: "2026-05-31T10:00:00.000Z" }),
      ]

      expect(countModifiedToday(notes, "UTC")).toBe(2)
    })

    test("returns zero when no notes were modified today", () => {
      getDateComponentsMock
        .mockReturnValueOnce({ day: 1, month: 6, year: 2026 })
        .mockReturnValueOnce({ day: 31, month: 5, year: 2026 })

      const notes = [createNote({ modifiedDate: "2026-05-31T10:00:00.000Z" })]

      expect(countModifiedToday(notes, "UTC")).toBe(0)
    })
  })

  describe("countFolders", () => {
    test("counts unique folders across notes", () => {
      const notes = [
        createNote({ folder: "projects", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "archive", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "projects", modifiedDate: "2026-06-01T00:00:00.000Z" }),
      ]

      expect(countFolders(notes)).toBe(2)
    })

    test("returns 0 for an empty note list", () => {
      expect(countFolders([])).toBe(0)
    })
  })

  describe("buildFolderBreakdown", () => {
    test("returns folder counts sorted by count descending then name ascending", () => {
      const notes = [
        createNote({ folder: "projects", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "archive", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "projects", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "archive", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "journal", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ folder: "archive", modifiedDate: "2026-06-01T00:00:00.000Z" }),
      ]

      expect(buildFolderBreakdown(notes)).toEqual([
        { count: 3, folder: "archive" },
        { count: 2, folder: "projects" },
        { count: 1, folder: "journal" },
      ])
    })

    test("returns an empty array for no notes", () => {
      expect(buildFolderBreakdown([])).toEqual([])
    })
  })

  describe("buildNotesCreated", () => {
    const now = new Date("2026-06-06T12:00:00.000Z")

    test("counts notes created within each time window", () => {
      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ createdDate: "2026-05-01T00:00:00.000Z", modifiedDate: "2026-05-01T00:00:00.000Z" }),
        createNote({ createdDate: "2026-01-01T00:00:00.000Z", modifiedDate: "2026-01-01T00:00:00.000Z" }),
        createNote({ createdDate: "2024-01-01T00:00:00.000Z", modifiedDate: "2024-01-01T00:00:00.000Z" }),
      ]

      const result = buildNotesCreated(notes, now)

      expect(result.last30Days).toBe(1)
      expect(result.last90Days).toBe(2)
      expect(result.last365Days).toBe(3)
    })

    test("returns zeros when no notes exist", () => {
      expect(buildNotesCreated([], now)).toEqual({
        last30Days: 0,
        last365Days: 0,
        last90Days: 0,
      })
    })
  })

  describe("buildTrends", () => {
    const now = new Date("2026-06-06T12:00:00.000Z")

    test("calculates positive trend when current period exceeds previous", () => {
      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ createdDate: "2026-05-20T00:00:00.000Z", modifiedDate: "2026-05-20T00:00:00.000Z" }),
        createNote({ createdDate: "2026-04-20T00:00:00.000Z", modifiedDate: "2026-04-20T00:00:00.000Z" }),
      ]

      const result = buildTrends(notes, now)

      expect(result.notesLast30Days).toBe(2)
      expect(result.notesPrevious30Days).toBe(1)
      expect(result.changePercent).toBe(100)
    })

    test("returns 100% change when previous period had no notes and current has some", () => {
      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
      ]

      const result = buildTrends(notes, now)

      expect(result.changePercent).toBe(100)
    })

    test("returns 0% change when both periods are empty", () => {
      expect(buildTrends([], now).changePercent).toBe(0)
    })
  })

  describe("buildNotesPerDay", () => {
    const now = new Date("2026-06-06T12:00:00.000Z")

    test("returns 365 entries", () => {
      getDateComponentsMock.mockImplementation((date) => {
        const d = new Date(date)
        return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }
      })

      const result = buildNotesPerDay([], "UTC", now)

      expect(result).toHaveLength(365)
    })

    test("counts notes on their creation date", () => {
      getDateComponentsMock.mockImplementation((date) => {
        const d = new Date(date)
        return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }
      })

      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ createdDate: "2026-06-01T12:00:00.000Z", modifiedDate: "2026-06-01T12:00:00.000Z" }),
        createNote({ createdDate: "2026-06-03T00:00:00.000Z", modifiedDate: "2026-06-03T00:00:00.000Z" }),
      ]

      const result = buildNotesPerDay(notes, "UTC", now)
      const june1 = result.find((d) => d.date === "2026-06-01")
      const june3 = result.find((d) => d.date === "2026-06-03")

      expect(june1?.count).toBe(2)
      expect(june3?.count).toBe(1)
    })

    test("ignores notes created outside the 365-day window", () => {
      getDateComponentsMock.mockImplementation((date) => {
        const d = new Date(date)
        return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }
      })

      const notes = [
        createNote({ createdDate: "2020-01-01T00:00:00.000Z", modifiedDate: "2020-01-01T00:00:00.000Z" }),
      ]

      const result = buildNotesPerDay(notes, "UTC", now)

      expect(result.every((d) => d.count === 0)).toBe(true)
    })

    test("skips notes with null createdDate", () => {
      getDateComponentsMock.mockImplementation((date) => {
        const d = new Date(date)
        return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }
      })

      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ createdDate: null, modifiedDate: "2026-06-01T00:00:00.000Z" }),
      ]

      const result = buildNotesPerDay(notes, "UTC", now)
      const jun1 = result.find((d) => d.date === "2026-06-01")

      expect(jun1?.count).toBe(1)
    })
  })

  describe("countNotesWithoutCreatedDate", () => {
    test("returns count of notes where createdDate is null", () => {
      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ createdDate: null, modifiedDate: "2026-06-01T00:00:00.000Z" }),
        createNote({ createdDate: null, modifiedDate: "2026-06-01T00:00:00.000Z" }),
      ]

      expect(countNotesWithoutCreatedDate(notes)).toBe(2)
    })

    test("returns 0 when all notes have a createdDate", () => {
      const notes = [
        createNote({ createdDate: "2026-06-01T00:00:00.000Z", modifiedDate: "2026-06-01T00:00:00.000Z" }),
      ]

      expect(countNotesWithoutCreatedDate(notes)).toBe(0)
    })
  })
})
