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
    parseMarkdownBodyDatesMock
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["2026.05.26"])
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
      "attachments",
    )
    expect(note).toMatchObject({
      basename: "welcome.md",
      titleOrBodyDates: ["2026.05.26"],
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
      "welcome",
      ["YYYY.MM.DD"],
    )
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
    parseMarkdownBodyDatesMock
      .mockReturnValueOnce(["2026.05.26"])
      .mockReturnValueOnce(["2026.05.26", "26/05/27"])
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

    expect(note.titleOrBodyDates).toEqual(["2026.05.26", "26/05/27"])
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
      "frontmatter",
      ["YYYY.MM.DD", "YY/MM/DD"],
    )
    expect(parseMarkdownBodyDatesMock).toHaveBeenCalledWith(
      "# Welcome\n\nThis is a note.",
      ["YYYY.MM.DD", "YY/MM/DD"],
    )
  })

  test("parseMarkdownFile escapes obsidian file path and strips extension", async () => {
    readFileMock.mockResolvedValue("content")
    parseFrontMatterMock.mockReturnValue({
      body: "content",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await parseMarkdownFile(
      "/notes/daily/2026.05.27 (Wed) á.md",
      "/notes",
      "vault name",
      [],
    )

    expect(note.obsidianUrl).toBe(
      "obsidian://open?vault=vault%20name&file=daily%2F2026.05.27%20(Wed)%20%C3%A1",
    )
  })

  test("parseMarkdownFile rewrites bare-filename images to obsidian attachment path in subfolder note", async () => {
    readFileMock.mockResolvedValue("![](attach-20260525090751252.jpg)")
    parseFrontMatterMock.mockReturnValue({
      body: "![](attach-20260525090751252.jpg)",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await parseMarkdownFile(
      "/notes/folder/file-name.md",
      "/notes",
      "vault",
      [],
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Ffolder%2Ffile-name%2Fattach-20260525090751252.jpg"',
    )
  })

  test("parseMarkdownFile rewrites bare-filename images to obsidian attachment path in root note", async () => {
    readFileMock.mockResolvedValue("![](attach-123.jpg)")
    parseFrontMatterMock.mockReturnValue({
      body: "![](attach-123.jpg)",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await parseMarkdownFile(
      "/notes/root-note.md",
      "/notes",
      "vault",
      [],
      "attachments",
    )

    expect(note.html).toContain(
      '<img src="/images?path=attachments%2Froot-note%2Fattach-123.jpg"',
    )
  })

  test("parseMarkdownFile uses configured attachmentsDirectory for bare-filename images", async () => {
    readFileMock.mockResolvedValue("![](photo.png)")
    parseFrontMatterMock.mockReturnValue({
      body: "![](photo.png)",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await parseMarkdownFile(
      "/notes/topic/note.md",
      "/notes",
      "vault",
      [],
      "assets",
    )

    expect(note.html).toContain(
      '<img src="/images?path=assets%2Ftopic%2Fnote%2Fphoto.png"',
    )
  })

  test("parseMarkdownFile rewrites relative markdown images to image server urls", async () => {
    readFileMock.mockResolvedValue("![Screenshot](./assets/home%20page.png)")
    parseFrontMatterMock.mockReturnValue({
      body: "![Screenshot](./assets/home%20page.png)",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await parseMarkdownFile(
      "/notes/daily/journal.md",
      "/notes",
      "vault",
      [],
    )

    expect(note.html).toContain(
      '<img src="/images?path=daily%2Fassets%2Fhome%20page.png"',
    )
  })

  test("parseMarkdownFile keeps external markdown image urls unchanged", async () => {
    readFileMock.mockResolvedValue("![Screenshot](https://example.com/image.png)")
    parseFrontMatterMock.mockReturnValue({
      body: "![Screenshot](https://example.com/image.png)",
      frontmatter: null,
    })
    parseMarkdownBodyDatesMock.mockReturnValue([])
    createFileIDMock.mockReturnValue("id")
    statMock.mockResolvedValue({
      birthtime: new Date("2026-05-26T00:00:00.000Z"),
      mtime: new Date("2026-05-26T01:00:00.000Z"),
    })

    const note = await parseMarkdownFile(
      "/notes/daily/journal.md",
      "/notes",
      "vault",
      [],
    )

    expect(note.html).toContain('<img src="https://example.com/image.png"')
  })
})
