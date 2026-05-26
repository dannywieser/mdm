import { promises as fs, type Dirent } from "node:fs"

import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

jest.mock("node:fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    stat: jest.fn()
  }
}))

const readdirMock = fs.readdir as jest.Mock
const readFileMock = fs.readFile as jest.Mock
const statMock = fs.stat as jest.Mock

const createDirent = (name: string, type: "file" | "directory"): Dirent =>
  ({
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file"
  }) as Dirent

describe("notes util helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
    statMock.mockResolvedValue({
      birthtime: createdDate,
      mtime: modifiedDate
    })

    const note = await parseMarkdownFile("/notes/topic/welcome.md")

    expect(note).toMatchObject({
      basename: "welcome.md",
      createdDate: "2026-05-26T00:00:00.000Z",
      folder: "topic",
      fullPath: "/notes/topic/welcome.md",
      id: "welcome",
      modifiedDate: "2026-05-26T01:00:00.000Z"
    })
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(readFileMock).toHaveBeenCalledWith("/notes/topic/welcome.md", "utf8")
    expect(statMock).toHaveBeenCalledWith("/notes/topic/welcome.md")
  })
})
