import type { Mock } from "vitest"

import { parseFrontMatter, parseMarkdownBodyDates } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs } from "node:fs"

import { FILE_ID_NAMESPACE, scanMarkdownFile } from "./notes.scan"

vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
    stat: vi.fn(),
  },
}))

vi.mock("markdown", () => ({
  parseFrontMatter: vi.fn(),
  parseMarkdownBodyDates: vi.fn(),
}))

vi.mock("mdm-util", () => ({
  createFileID: vi.fn(),
}))

const createFileIDMock = vi.mocked(createFileID)
const readFileMock = fs.readFile as Mock
const statMock = fs.stat as Mock
const parseFrontMatterMock = vi.mocked(parseFrontMatter)
const parseMarkdownBodyDatesMock = vi.mocked(parseMarkdownBodyDates)

describe("notes scan helpers", () => {
  test("scanMarkdownFile returns filterable metadata without parsed markdown content", async () => {
    const createdDate = new Date("2026-05-26T00:00:00.000Z")
    const modifiedDate = new Date("2026-05-26T01:00:00.000Z")

    readFileMock.mockResolvedValue("# Welcome\n\nThis is a note.")
    parseFrontMatterMock.mockReturnValue({
      body: "# Welcome\n\nThis is a note.",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["2026.05.26"])
    createFileIDMock.mockReturnValue("17e3771f-2773-5c87-8f66-6a455a878763")
    statMock.mockResolvedValue({
      birthtime: createdDate,
      mtime: modifiedDate,
    })

    const note = await scanMarkdownFile(
      "/notes/topic/welcome.md",
      "/notes",
      "dgw",
      ["YYYY.MM.DD"],
    )

    expect(note).toEqual({
      basename: "welcome.md",
      titleOrBodyDates: ["2026.05.26"],
      createdDate: "2026-05-26T00:00:00.000Z",
      folder: "topic",
      frontmatter: null,
      fullPath: "/notes/topic/welcome.md",
      id: "17e3771f-2773-5c87-8f66-6a455a878763",
      modifiedDate: "2026-05-26T01:00:00.000Z",
      obsidianUrl: "obsidian://open?vault=dgw&file=topic%2Fwelcome",
      title: "welcome",
    })
    expect(note).not.toHaveProperty("content")
    expect(FILE_ID_NAMESPACE).toBe("6ba7b811-9dad-11d1-80b4-00c04fd430c8")
    expect(readFileMock).toHaveBeenCalledWith("/notes/topic/welcome.md", "utf8")
    expect(parseFrontMatterMock).toHaveBeenCalledWith("# Welcome\n\nThis is a note.")
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith("welcome", ["YYYY.MM.DD"])
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith(
      "# Welcome\n\nThis is a note.",
      ["YYYY.MM.DD"],
    )
    expect(createFileIDMock).toHaveBeenCalledWith(
      "/notes/topic/welcome.md",
      FILE_ID_NAMESPACE,
    )
    expect(statMock).toHaveBeenCalledWith("/notes/topic/welcome.md")
  })

  test("scanMarkdownFile sets folder to the full relative path from the notes directory", async () => {
    readFileMock.mockResolvedValue("# Note")
    parseFrontMatterMock.mockReturnValue({ body: "# Note", frontmatter: null })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("some-id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await scanMarkdownFile(
      "/notes/daily/briefing/2026-06-01.md",
      "/notes",
      "dgw",
    )

    expect(note.folder).toBe("daily/briefing")
  })

  test("scanMarkdownFile includes date-like frontmatter values in titleOrBodyDates", async () => {
    readFileMock.mockResolvedValue("# Note")
    parseFrontMatterMock.mockReturnValue({
      body: "# Note",
      frontmatter: {
        created: "2026.06.01",
        tags: ["reading", "2025.12.31"],
      },
    })
    parseMarkdownBodyDatesMock
      .mockReturnValueOnce([])                // title
      .mockReturnValueOnce([])                // body
      .mockReturnValueOnce(["2026.06.01"])    // frontmatter: created
      .mockReturnValueOnce([])                // frontmatter: reading
      .mockReturnValueOnce(["2025.12.31"])    // frontmatter: 2025.12.31
    createFileIDMock.mockReturnValue("some-id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-06-01T00:00:00.000Z"),
      mtime: new Date("2026-06-01T01:00:00.000Z"),
    })

    const note = await scanMarkdownFile("/notes/note.md", "/notes", "vault", ["YYYY.MM.DD"])

    expect(note.titleOrBodyDates).toEqual(["2026.06.01", "2025.12.31"])
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith("2026.06.01", ["YYYY.MM.DD"])
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith("reading", ["YYYY.MM.DD"])
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith("2025.12.31", ["YYYY.MM.DD"])
  })

  test("scanMarkdownFile uses parsed frontmatter and escapes obsidian file paths", async () => {
    readFileMock.mockResolvedValue(`---
topic:
  - AI
  - Notes
created: 2026.05.26
---
# Welcome

This is a note.`)
    parseFrontMatterMock.mockReturnValue({
      body: "# Welcome\n\nThis is a note.",
      frontmatter: {
        created: "2026.05.26",
        topic: ["AI", "Notes"],
      },
    })
    parseMarkdownBodyDatesMock
      .mockReturnValueOnce(["2026.05.26"])          // title
      .mockReturnValueOnce(["2026.05.26", "26/05/27"]) // body
      .mockReturnValueOnce(["2026.05.26"])          // frontmatter: created
      .mockReturnValueOnce([])                      // frontmatter: AI
      .mockReturnValueOnce([])                      // frontmatter: Notes
    createFileIDMock.mockReturnValue("frontmatter-id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await scanMarkdownFile(
      "/notes/daily/2026.05.27 (Wed) á.md",
      "/notes",
      "vault name",
      ["YYYY.MM.DD", "YY/MM/DD"],
    )

    expect(note.titleOrBodyDates).toEqual(["2026.05.26", "26/05/27"])
    expect(note.frontmatter).toEqual({
      created: "2026.05.26",
      topic: ["AI", "Notes"],
    })
    expect(note.id).toBe("frontmatter-id")
    expect(note.obsidianUrl).toBe(
      "obsidian://open?vault=vault%20name&file=daily%2F2026.05.27%20(Wed)%20%C3%A1",
    )
    expect(note.title).toBe("2026.05.27 (Wed) á")
  })
})
