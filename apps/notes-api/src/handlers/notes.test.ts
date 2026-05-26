import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { collectMarkdownFiles, parseMarkdownFile } from "./notes"

describe("notes handler helpers", () => {
  let notesRoot: string

  beforeEach(async () => {
    notesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "notes-handler-test-"))
  })

  afterEach(async () => {
    await fs.rm(notesRoot, { recursive: true, force: true })
  })

  test("collectMarkdownFiles finds markdown files recursively", async () => {
    const nestedDirectory = path.join(notesRoot, "nested")
    const deepDirectory = path.join(nestedDirectory, "deep")
    const expectedMarkdownPaths = [
      path.join(notesRoot, "root.md"),
      path.join(nestedDirectory, "child.markdown"),
      path.join(deepDirectory, "upper.MD")
    ]

    await fs.mkdir(deepDirectory, { recursive: true })
    await Promise.all([
      fs.writeFile(expectedMarkdownPaths[0], "# Root"),
      fs.writeFile(expectedMarkdownPaths[1], "## Child"),
      fs.writeFile(expectedMarkdownPaths[2], "### Upper"),
      fs.writeFile(path.join(notesRoot, "ignore.txt"), "ignore")
    ])

    const markdownFiles = await collectMarkdownFiles(notesRoot)

    expect(markdownFiles.sort()).toEqual(expectedMarkdownPaths.sort())
  })

  test("parseMarkdownFile returns rendered html and metadata", async () => {
    const topicDirectory = path.join(notesRoot, "topic")
    const markdownPath = path.join(topicDirectory, "welcome.md")

    await fs.mkdir(topicDirectory)
    await fs.writeFile(markdownPath, "# Welcome\n\nThis is a note.")

    const note = await parseMarkdownFile(markdownPath)

    expect(note.basename).toBe("welcome.md")
    expect(note.id).toBe("welcome")
    expect(note.folder).toBe("topic")
    expect(note.fullPath).toBe(markdownPath)
    expect(note.html).toContain("<h1>Welcome</h1>")
    expect(Number.isFinite(Date.parse(note.createdDate))).toBe(true)
    expect(Number.isFinite(Date.parse(note.modifiedDate))).toBe(true)
  })
})
