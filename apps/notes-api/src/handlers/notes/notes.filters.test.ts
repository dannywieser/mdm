import type { Note } from "markdown"

import {
  getDateComponents,
  getValueByPath,
  parseDateFromFormats,
} from "mdm-util"

import { applyViewFilter } from "./notes.filters"

jest.mock("mdm-util", () => ({
  getDateComponents: jest.fn(),
  getValueByPath: jest.fn(),
  parseDateFromFormats: jest.fn(),
}))

const getDateComponentsMock = jest.mocked(getDateComponents)
const getValueByPathMock = jest.mocked(getValueByPath)
const parseDateFromFormatsMock = jest.mocked(parseDateFromFormats)

describe("notes filter helpers", () => {
  beforeEach(() => {
    getValueByPathMock.mockImplementation((value, valuePath) =>
      String(valuePath)
        .split(".")
        .filter((segment) => segment.length > 0)
        .reduce<unknown>((currentValue, segment) => {
          if (!currentValue || typeof currentValue !== "object") {
            return undefined
          }

          return (currentValue as Record<string, unknown>)[segment]
        }, value),
    )

    parseDateFromFormatsMock.mockImplementation((dateValue) => {
      const match = String(dateValue).match(/^(\d{4})\.(\d{2})\.(\d{2})$/)

      if (!match) {
        return null
      }

      return {
        day: parseInt(match[3], 10),
        month: parseInt(match[2], 10),
        year: parseInt(match[1], 10),
      }
    })
  })

  test("applyViewFilter returns all notes when no view is requested", () => {
    const notes = [createMockNote("book.md"), createMockNote("movie.md")]

    const filtered = applyViewFilter(notes, [], undefined)

    expect(filtered).toEqual(notes)
    expect(getValueByPathMock).not.toHaveBeenCalled()
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
          filters: [
            {
              folder: "downtime",
              "frontmatter.type": "book",
            },
          ],
          name: "books",
        },
      ],
      "books",
    )

    expect(filtered).toEqual([notes[0]])
    expect(getValueByPathMock).toHaveBeenCalled()
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
          filters: [{ "frontmatter.topic": "Reading" }],
          name: "reading",
        },
      ],
      "reading",
    )

    expect(filtered).toEqual([notes[0]])
    expect(getValueByPathMock).toHaveBeenCalledWith(notes[0], "frontmatter.topic")
  })

  test("applyViewFilter matches notes satisfying any filter group (OR logic)", () => {
    const notes = [
      createMockNote("book.md", {
        frontmatter: { type: "book" },
      }),
      createMockNote("game.md", {
        frontmatter: { type: "game" },
      }),
      createMockNote("movie.md", {
        frontmatter: { type: "movie" },
      }),
    ]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: [
            { "frontmatter.type": "book" },
            { "frontmatter.type": "game" },
          ],
          name: "downtime",
        },
      ],
      "downtime",
    )

    expect(filtered).toEqual([notes[0], notes[1]])
  })

  test("applyViewFilter returns all notes when view name is not configured", () => {
    const notes = [createMockNote("book.md"), createMockNote("movie.md")]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: [{ folder: "downtime" }],
          name: "books",
        },
      ],
      "missing",
    )

    expect(filtered).toEqual(notes)
    expect(getValueByPathMock).not.toHaveBeenCalled()
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
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2024 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 26, month: 5, year: 2024 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })

      const filtered = applyViewFilter(
        notes,
        [{ filters: [{ createdDate: "$onThisDay" }], name: "memories" }],
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
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2023 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 6, year: 2023 })

      const filtered = applyViewFilter(
        notes,
        [{ filters: [{ modifiedDate: "$onThisDay" }], name: "memories" }],
        "memories",
        { dateFormats: [], timezone: "UTC" },
      )

      expect(filtered).toEqual([notes[0]])
    })

    test("matches notes where any titleOrBodyDate falls on the same month and day in a previous year", () => {
      const notes = [
        createMockNote("has-match.md", {
          titleOrBodyDates: ["2024.05.27", "2024.06.01"],
        }),
        createMockNote("no-match.md", { titleOrBodyDates: ["2024.05.26"] }),
        createMockNote("this-year.md", { titleOrBodyDates: ["2026.05.27"] }),
      ]

      getDateComponentsMock
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })

      const filtered = applyViewFilter(
        notes,
        [{ filters: [{ titleOrBodyDates: "$onThisDay" }], name: "memories" }],
        "memories",
        { dateFormats: ["YYYY.MM.DD"], timezone: "UTC" },
      )

      expect(filtered).toEqual([notes[0]])
      expect(parseDateFromFormatsMock).toHaveBeenCalledWith("2024.05.27", [
        "YYYY.MM.DD",
      ])
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

      getDateComponentsMock
        .mockReturnValueOnce({ day: 26, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 26, month: 5, year: 2025 })
        .mockReturnValueOnce({ day: 26, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2025 })

      const filtered = applyViewFilter(
        notes,
        [{ filters: [{ createdDate: "$onThisDay" }], name: "memories" }],
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
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2026 })
        .mockReturnValueOnce({ day: 27, month: 5, year: 2025 })

      const filtered = applyViewFilter(
        notes,
        [{ filters: [{ createdDate: "$onThisDay" }], name: "memories" }],
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
  titleOrBodyDates: [],
  createdDate: "2026-05-26T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: `/notes/${basename}`,
  html: "<h1>Note</h1>",
  id: basename.replace(/\.[^.]+$/, ""),
  modifiedDate: "2026-05-26T01:00:00.000Z",
  obsidianUrl: `obsidian://open?vault=vault&file=${encodeURI(
    basename.replace(/\.[^.]+$/, ""),
  )}`,
  title: basename.replace(/\.md$/, ""),
})
