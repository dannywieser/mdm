import { parseFrontMatter } from "markdown"
import { promises as fs, type Dirent } from "node:fs"

import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

jest.mock("node:fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    stat: jest.fn()
  }
}))
jest.mock("markdown", () => ({
  parseFrontMatter: jest.fn()
}))

const readdirMock = fs.readdir as jest.Mock
const readFileMock = fs.readFile as jest.Mock
const statMock = fs.stat as jest.Mock
const parseFrontMatterMock = jest.mocked(parseFrontMatter)

const createDirent = (name: string, type: "file" | "directory"): Dirent =>
  ({
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file"
  }) as Dirent

describe("notes util helpers", () => {
  test("collectMarkdownFiles finds markdown files recursively", async () => {
    readdirMock
      .mockResolvedValueOnce([
        createDirent("root.md", "file"),
        createDirent("nested", "directory"),
        createDirent("ignore.txt", "file")
      ])
      .mockResolvedValueOnce([
        createDirent("child.markdown", "file"),
        createDirent("deep", "directory")
      ])
      .mockResolvedValueOnce([createDirent("upper.MD", "file")])

    const markdownFiles = await collectMarkdownFiles("/notes")

    expect(markdownFiles.sort()).toEqual([
      "/notes/root.md",
      "/notes/nested/child.markdown",
      "/notes/nested/deep/upper.MD"
    ].sort())
    expect(readdirMock).toHaveBeenNthCalledWith(1, "/notes", {
      withFileTypes: true
    })
    expect(readdirMock).toHaveBeenNthCalledWith(2, "/notes/nested", {
      withFileTypes: true
    })
    expect(readdirMock).toHaveBeenNthCalledWith(3, "/notes/nested/deep", {
      withFileTypes: true
    })
  })

  test("parseMarkdownFile returns rendered html and metadata", async () => {
    const createdDate = new Date("2026-05-26T00:00:00.000Z")
    const modifiedDate = new Date("2026-05-26T01:00:00.000Z")

    readFileMock.mockResolvedValue("# Welcome\n\nThis is a note.")
    parseFrontMatterMock.mockReturnValue({
      body: "# Welcome\n\nThis is a note.",
      frontmatter: null
    })
    statMock.mockResolvedValue({
      birthtime: createdDate,
      mtime: modifiedDate
    })

    const note = await parseMarkdownFile("/notes/topic/welcome.md")

    expect(note).toMatchObject({
      basename: "welcome.md",
      createdDate: "2026-05-26T00:00:00.000Z",
      folder: "topic",
      frontmatter: null,
      fullPath: "/notes/topic/welcome.md",
      id: "welcome",
      modifiedDate: "2026-05-26T01:00:00.000Z"
    })
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(readFileMock).toHaveBeenCalledWith("/notes/topic/welcome.md", "utf8")
    expect(parseFrontMatterMock).toHaveBeenCalledWith("# Welcome\n\nThis is a note.")
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
        topic: ["AI", "Notes"]
      }
    })
    statMock.mockResolvedValue({
      birthtime: createdDate,
      mtime: modifiedDate
    })

    const note = await parseMarkdownFile("/notes/topic/frontmatter.md")

    expect(note.frontmatter).toEqual({
      created: "2026.05.26",
      topic: ["AI", "Notes"]
    })
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(note.html).toContain("<p>This is a note.</p>")
    expect(parseFrontMatterMock).toHaveBeenCalledWith(`---
topic:
  - AI
  - Notes
created: 2026.05.26
---
# Welcome

This is a note.`)
  })
})
