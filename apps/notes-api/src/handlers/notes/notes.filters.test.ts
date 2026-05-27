import type { Note } from "markdown"

import { getDateComponents } from "mdm-util"

import { applyViewFilter } from "./notes.filters"

jest.mock("mdm-util", () => ({
  getDateComponents: jest.fn(),
}))

const getDateComponentsMock = jest.mocked(getDateComponents)

describe("notes filter helpers", () => {
  test("applyViewFilter returns all notes when no view is requested", () => {
    const notes = [createMockNote("book.md"), createMockNote("movie.md")]

    const filtered = applyViewFilter(notes, [], undefined)

    expect(filtered).toEqual(notes)
  })

  test("applyViewFilter filters notes using configured view filters", () => {
    const notes = [
      createMockNote("book.md", {
        folder: "downtime",
        frontmatter: {
          topic: ["Reading"],
          type: "book",
        },
      }),
      createMockNote("movie.md", {
        folder: "downtime",
        frontmatter: {
          type: "movie",
        },
      }),
      createMockNote("todo.md", {
        folder: "work",
        frontmatter: {
          type: "book",
        },
      }),
    ]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: {
            folder: "downtime",
            "frontmatter.type": "book",
          },
          name: "books",
        },
      ],
      "books",
    )

    expect(filtered).toEqual([notes[0]])
  })

  test("applyViewFilter supports array frontmatter values", () => {
    const notes = [
      createMockNote("read.md", {
        frontmatter: {
          topic: ["Reading", "AI"],
        },
      }),
      createMockNote("write.md", {
        frontmatter: {
          topic: ["Writing"],
        },
      }),
    ]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: {
            "frontmatter.topic": "Reading",
          },
          name: "reading",
        },
      ],
      "reading",
    )

    expect(filtered).toEqual([notes[0]])
  })

  test("applyViewFilter returns all notes when view name is not configured", () => {
    const notes = [createMockNote("book.md"), createMockNote("movie.md")]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: {
            folder: "downtime",
          },
          name: "books",
        },
      ],
      "missing",
    )

    expect(filtered).toEqual(notes)
  })

  describe("$onThisDay keyword", () => {
    test("matches notes where createdDate falls on the same month and day in a previous year", () => {
      const notes = [
        createMockNote("past.md", { createdDate: "2024-05-27T08:00:00.000Z" }),
        createMockNote("different-day.md", {
          createdDate: "2024-05-26T08:00:00.000Z",
        }),
        createMockNote("this-year.md", {
          createdDate: "2026-05-27T08:00:00.000Z",
        }),
      ]

      getDateComponentsMock
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 1
        .mockReturnValueOnce({ day: 27, month: 5, year: 2024 }) // note 1 date — same day, past year ✓
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 2
        .mockReturnValueOnce({ day: 26, month: 5, year: 2024 }) // note 2 date — different day ✗
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 3
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // note 3 date — same year ✗

      const filtered = applyViewFilter(
        notes,
        [{ filters: { createdDate: "$onThisDay" }, name: "memories" }],
        "memories",
        { dateFormats: [], timezone: "UTC" },
      )

      expect(filtered).toEqual([notes[0]])
    })

    test("matches notes where modifiedDate falls on the same month and day in a previous year", () => {
      const notes = [
        createMockNote("past.md", { modifiedDate: "2023-05-27T10:00:00.000Z" }),
        createMockNote("other.md", {
          modifiedDate: "2023-06-27T10:00:00.000Z",
        }),
      ]

      getDateComponentsMock
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 1
        .mockReturnValueOnce({ day: 27, month: 5, year: 2023 }) // note 1 date — same day, past year ✓
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 2
        .mockReturnValueOnce({ day: 27, month: 6, year: 2023 }) // note 2 date — different month ✗

      const filtered = applyViewFilter(
        notes,
        [{ filters: { modifiedDate: "$onThisDay" }, name: "memories" }],
        "memories",
        { dateFormats: [], timezone: "UTC" },
      )

      expect(filtered).toEqual([notes[0]])
    })

    test("matches notes where any bodyDate falls on the same month and day in a previous year", () => {
      const notes = [
        createMockNote("has-match.md", {
          bodyDates: ["2024.05.27", "2024.06.01"],
        }),
        createMockNote("no-match.md", { bodyDates: ["2024.05.26"] }),
        createMockNote("this-year.md", { bodyDates: ["2026.05.27"] }),
      ]

      // bodyDates uses parseDateFromFormats (not getDateComponents) for the note date,
      // so only one call per note — for today
      getDateComponentsMock
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 1
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 2
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 3

      const filtered = applyViewFilter(
        notes,
        [{ filters: { bodyDates: "$onThisDay" }, name: "memories" }],
        "memories",
        { dateFormats: ["YYYY.MM.DD"], timezone: "UTC" },
      )

      expect(filtered).toEqual([notes[0]])
    })

    test("applies the configured timezone when determining today's date", () => {
      const notes = [
        createMockNote("may-26.md", {
          createdDate: "2025-05-26T08:00:00.000Z",
        }),
        createMockNote("may-27.md", {
          createdDate: "2025-05-27T08:00:00.000Z",
        }),
      ]

      // Simulates "today" being May 26 in America/Toronto (e.g. 2026-05-27T03:00Z in UTC)
      getDateComponentsMock
        .mockReturnValueOnce({ day: 26, month: 5, year: 2026 }) // today in Toronto — note 1
        .mockReturnValueOnce({ day: 26, month: 5, year: 2025 }) // note 1 date in Toronto ✓
        .mockReturnValueOnce({ day: 26, month: 5, year: 2026 }) // today in Toronto — note 2
        .mockReturnValueOnce({ day: 27, month: 5, year: 2025 }) // note 2 date in Toronto ✗

      const filtered = applyViewFilter(
        notes,
        [{ filters: { createdDate: "$onThisDay" }, name: "memories" }],
        "memories",
        { dateFormats: [], timezone: "America/Toronto" },
      )

      expect(filtered).toEqual([notes[0]])
    })

    test("does not match notes from the current year", () => {
      const notes = [
        createMockNote("this-year.md", {
          createdDate: "2026-05-27T08:00:00.000Z",
        }),
        createMockNote("last-year.md", {
          createdDate: "2025-05-27T08:00:00.000Z",
        }),
      ]

      getDateComponentsMock
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 1
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // note 1 date — same year ✗
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 }) // today — note 2
        .mockReturnValueOnce({ day: 27, month: 5, year: 2025 }) // note 2 date — past year ✓

      const filtered = applyViewFilter(
        notes,
        [{ filters: { createdDate: "$onThisDay" }, name: "memories" }],
        "memories",
        { dateFormats: [], timezone: "UTC" },
      )

      expect(filtered).toEqual([notes[1]])
    })
  })
})

const createMockNote = (
  basename: string,
  overrides: Partial<Note> = {},
): Note => ({
  ...defaultMockNote(basename),
  ...overrides,
})

const defaultMockNote = (basename: string): Note => ({
  basename,
  bodyDates: [],
  createdDate: "2026-05-26T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: `/notes/${basename}`,
  html: "<h1>Note</h1>",
  id: basename.replace(/\.[^.]+$/, ""),
  modifiedDate: "2026-05-26T01:00:00.000Z",
})
