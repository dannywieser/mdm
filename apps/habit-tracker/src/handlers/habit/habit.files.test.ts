import type { Mock } from "vitest"

import { parseDateString, parseFrontMatter, parseMarkdownBodyDates } from "markdown"
import { promises as fs } from "node:fs"

import { scanHabitEntries } from "./habit.files"

vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
  },
}))

vi.mock("markdown", () => ({
  parseDateString: vi.fn(),
  parseFrontMatter: vi.fn(),
  parseMarkdownBodyDates: vi.fn(),
}))

const readFileMock = fs.readFile as Mock
const parseFrontMatterMock = vi.mocked(parseFrontMatter)
const parseDateStringMock = vi.mocked(parseDateString)
const parseMarkdownBodyDatesMock = vi.mocked(parseMarkdownBodyDates)

const DATE_FORMATS = ["YYYY.MM.DD"]

describe("scanHabitEntries", () => {
  beforeEach(() => {
    parseMarkdownBodyDatesMock.mockReturnValue([])
  })

  test("strips surrounding quotes from frontmatter values before parsing the numeric value", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"3\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.31", drinking: '"3"' },
    })
    parseDateStringMock.mockReturnValue(new Date("2026-05-31T00:00:00.000Z"))

    const entries = await scanHabitEntries(
      ["/notes/2026.05.31.md"],
      "drinking",
      "created",
      false,
      DATE_FORMATS,
    )

    expect(entries).toEqual([{ date: "2026-05-31", value: 3 }])
  })

  test("parses unquoted numeric frontmatter values", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: 5\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.13", drinking: "5" },
    })
    parseDateStringMock.mockReturnValue(new Date("2026-05-13T00:00:00.000Z"))

    const entries = await scanHabitEntries(
      ["/notes/2026.05.13.md"],
      "drinking",
      "created",
      false,
      DATE_FORMATS,
    )

    expect(entries).toEqual([{ date: "2026-05-13", value: 5 }])
  })

  test("skips notes without frontmatter", async () => {
    readFileMock.mockResolvedValue("body only")
    parseFrontMatterMock.mockReturnValue({ body: "body only", frontmatter: null })

    const entries = await scanHabitEntries(["/notes/no-frontmatter.md"], "drinking", "created", false, DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("skips notes where the configured property is missing", async () => {
    readFileMock.mockResolvedValue("---\ntopic: drinking\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { topic: "drinking" },
    })

    const entries = await scanHabitEntries(["/notes/missing-property.md"], "drinking", "created", false, DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("skips notes where the configured property is out of the 1-10 range", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"15\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.31", drinking: '"15"' },
    })

    const entries = await scanHabitEntries(["/notes/out-of-range.md"], "drinking", "created", false, DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("skips notes whose date cannot be resolved", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"3\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { drinking: '"3"' },
    })

    const entries = await scanHabitEntries(["/notes/no-date.md"], "drinking", "created", false, DATE_FORMATS)

    expect(entries).toEqual([])
  })

  test("derives the date from the title when deriveTitleDate is enabled and frontmatter has no usable date", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"3\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { drinking: '"3"' },
    })
    parseMarkdownBodyDatesMock.mockReturnValue(["2026.05.31"])
    parseDateStringMock.mockReturnValue(new Date("2026-05-31T00:00:00.000Z"))

    const entries = await scanHabitEntries(
      ["/notes/2026.05.31 (Sun).md"],
      "drinking",
      "created",
      true,
      DATE_FORMATS,
    )

    expect(entries).toEqual([{ date: "2026-05-31", value: 3 }])
  })
})
