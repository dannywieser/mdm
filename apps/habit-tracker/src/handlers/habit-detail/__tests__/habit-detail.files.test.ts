import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { parseFrontMatter } from "markdown"
import { promises as fs } from "node:fs"

import { scanHabitEntries } from "../habit-detail.files"

vi.mock("app-config", () => ({
  resolveNotesConfig: vi.fn(),
}))

vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
  },
}))

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    parseFrontMatter: vi.fn(),
  }
})

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const readFileMock = vi.mocked(fs.readFile)
const parseFrontMatterMock = vi.mocked(parseFrontMatter)

const defaultConfig = createMockNotesConfig({ dateFormats: ["YYYY.MM.DD"] })

describe("scanHabitEntries", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(defaultConfig)
  })

  test("strips surrounding quotes from frontmatter values before parsing the numeric value", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"3\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.31", drinking: '"3"' },
    })

    const entries = await scanHabitEntries(["/notes/2026.05.31.md"], "drinking")

    expect(entries).toEqual([
      { date: "2026-05-31", value: 3, obsidianUrl: "obsidian://open?vault=vault&file=2026.05.31" },
    ])
  })

  test("parses unquoted numeric frontmatter values", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: 5\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.13", drinking: "5" },
    })

    const entries = await scanHabitEntries(["/notes/2026.05.13.md"], "drinking")

    expect(entries).toEqual([
      { date: "2026-05-13", value: 5, obsidianUrl: "obsidian://open?vault=vault&file=2026.05.13" },
    ])
  })

  test("skips notes without frontmatter", async () => {
    readFileMock.mockResolvedValue("body only")
    parseFrontMatterMock.mockReturnValue({ body: "body only", frontmatter: null })

    const entries = await scanHabitEntries(["/notes/no-frontmatter.md"], "drinking")

    expect(entries).toEqual([])
  })

  test("skips notes where the configured property is missing", async () => {
    readFileMock.mockResolvedValue("---\ntopic: drinking\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { topic: "drinking" },
    })

    const entries = await scanHabitEntries(["/notes/missing-property.md"], "drinking")

    expect(entries).toEqual([])
  })

  test("skips notes where the configured property is below the minimum of 1", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"0\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.31", drinking: '"0"' },
    })

    const entries = await scanHabitEntries(["/notes/below-minimum.md"], "drinking")

    expect(entries).toEqual([])
  })

  test("accepts values above 10, for habits tracking unbounded quantities like a dollar amount", async () => {
    readFileMock.mockResolvedValue("---\nspending: \"80\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { created: "2026.05.31", spending: '"80"' },
    })

    const entries = await scanHabitEntries(["/notes/2026.05.31.md"], "spending")

    expect(entries).toEqual([
      { date: "2026-05-31", value: 80, obsidianUrl: "obsidian://open?vault=vault&file=2026.05.31" },
    ])
  })

  test("skips notes whose date cannot be resolved from frontmatter or title", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"3\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { drinking: '"3"' },
    })

    const entries = await scanHabitEntries(["/notes/no-date.md"], "drinking")

    expect(entries).toEqual([])
  })

  test("derives the date from the title when frontmatter has no usable date", async () => {
    readFileMock.mockResolvedValue("---\ndrinking: \"3\"\n---\nbody")
    parseFrontMatterMock.mockReturnValue({
      body: "body",
      frontmatter: { drinking: '"3"' },
    })

    const entries = await scanHabitEntries(["/notes/2026.05.31 (Sun).md"], "drinking")

    expect(entries).toEqual([
      { date: "2026-05-31", value: 3, obsidianUrl: "obsidian://open?vault=vault&file=2026.05.31%20(Sun)" },
    ])
  })
})
