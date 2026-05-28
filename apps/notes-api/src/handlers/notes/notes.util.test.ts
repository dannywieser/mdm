import { parseFrontMatter, parseMarkdownBodyDates } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs, type Dirent } from "node:fs"

import {
  collectMarkdownFiles,
  FILE_ID_NAMESPACE,
  parseMarkdownFile,
} from "./notes.util"

jest.mock("node:fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    stat: jest.fn(),
  },
}))

jest.mock("markdown", () => ({
  parseFrontMatter: jest.fn(),
  parseMarkdownBodyDates: jest.fn(),
}))

jest.mock("mdm-util", () => ({
  createFileID: jest.fn(),
}))

const createFileIDMock = jest.mocked(createFileID)
const readdirMock = fs.readdir as jest.Mock
const readFileMock = fs.readFile as jest.Mock
const statMock = fs.stat as jest.Mock
const parseFrontMatterMock = jest.mocked(parseFrontMatter)
const parseMarkdownBodyDatesMock = jest.mocked(parseMarkdownBodyDates)

const createDirent = (name: string, type: "file" | "directory"): Dirent =>
  ({
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file",
  }) as Dirent

describe("notes util helpers", () => {
  test("collectMarkdownFiles finds markdown files recursively", async () => {
    readdirMock
      .mockResolvedValueOnce([
        createDirent("root.md", "file"),
        createDirent("nested", "directory"),
        createDirent("ignore.txt", "file"),
      ])
      .mockResolvedValueOnce([
        createDirent("child.markdown", "file"),
        createDirent("deep", "directory"),
      ])
      .mockResolvedValueOnce([createDirent("upper.MD", "file")])

    const markdownFiles = await collectMarkdownFiles("/notes")

    expect(markdownFiles.sort()).toEqual(
      [
        "/notes/root.md",
        "/notes/nested/child.markdown",
        "/notes/nested/deep/upper.MD",
      ].sort(),
    )
    expect(readdirMock).toHaveBeenNthCalledWith(1, "/notes", {
      withFileTypes: true,
    })
    expect(readdirMock).toHaveBeenNthCalledWith(2, "/notes/nested", {
      withFileTypes: true,
    })
    expect(readdirMock).toHaveBeenNthCalledWith(3, "/notes/nested/deep", {
      withFileTypes: true,
    })
  })

  test("parseMarkdownFile returns rendered html and metadata", async () => {
    const createdDate = new Date("2026-05-26T00:00:00.000Z")
    const modifiedDate = new Date("2026-05-26T01:00:00.000Z")

    readFileMock.mockResolvedValue("# Welcome\n\nThis is a note.")
    parseFrontMatterMock.mockReturnValue({
      body: "# Welcome\n\nThis is a note.",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue(["2026.05.26"])
    createFileIDMock.mockReturnValue("17e3771f-2773-5c87-8f66-6a455a878763")
    statMock.mockResolvedValue({
      birthtime: createdDate,
      mtime: modifiedDate,
    })

    const note = await parseMarkdownFile(
      "/notes/topic/welcome.md",
      "/notes",
      "dgw",
      ["YYYY.MM.DD"],
    )

    expect(note).toMatchObject({
      basename: "welcome.md",
      bodyDates: ["2026.05.26"],
      createdDate: "2026-05-26T00:00:00.000Z",
      folder: "topic",
      frontmatter: null,
      fullPath: "/notes/topic/welcome.md",
      modifiedDate: "2026-05-26T01:00:00.000Z",
      obsidianUrl: "obsidian://open?vault=dgw&file=topic%2Fwelcome",
      title: "welcome",
    })
    expect(FILE_ID_NAMESPACE).toBe("6ba7b811-9dad-11d1-80b4-00c04fd430c8")
    expect(note.id).toBe("17e3771f-2773-5c87-8f66-6a455a878763")
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(readFileMock).toHaveBeenCalledWith("/notes/topic/welcome.md", "utf8")
    expect(parseFrontMatterMock).toHaveBeenCalledWith("# Welcome\n\nThis is a note.")
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

  test("parseMarkdownFile uses parsed frontmatter and stripped markdown body", async () => {
    const createdDate = new Date("2026-05-26T00:00:00.000Z")
    const modifiedDate = new Date("2026-05-26T01:00:00.000Z")

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
    parseMarkdownBodyDatesMock.mockReturnValue(["2026.05.26", "26/05/27"])
    createFileIDMock.mockReturnValue("frontmatter-id")
    statMock.mockResolvedValue({
      birthtime: createdDate,
      mtime: modifiedDate,
    })

    const note = await parseMarkdownFile(
      "/notes/topic/frontmatter.md",
      "/notes",
      "dgw",
      ["YYYY.MM.DD", "YY/MM/DD"],
    )

    expect(note.bodyDates).toEqual(["2026.05.26", "26/05/27"])
    expect(note.frontmatter).toEqual({
      created: "2026.05.26",
      topic: ["AI", "Notes"],
    })
    expect(note.id).toBe("frontmatter-id")
    expect(note.obsidianUrl).toBe(
      "obsidian://open?vault=dgw&file=topic%2Ffrontmatter",
    )
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(note.html).toContain("<p>This is a note.</p>")
    expect(note.title).toBe("frontmatter")
    expect(parseFrontMatterMock).toHaveBeenCalledWith(`---
topic:
  - AI
  - Notes
created: 2026.05.26
---
# Welcome

This is a note.`)
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith(
      "# Welcome\n\nThis is a note.",
      ["YYYY.MM.DD", "YY/MM/DD"],
    )
  })
})
