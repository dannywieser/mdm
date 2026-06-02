import type { Mock } from "vitest"

import { promises as fs, type Dirent } from "node:fs"

import { collectMarkdownFiles } from "./notes.files"

vi.mock("node:fs", () => ({
  promises: {
    readdir: vi.fn(),
  },
}))

const readdirMock = fs.readdir as Mock

const createDirent = (name: string, type: "file" | "directory"): Dirent =>
  ({
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file",
  }) as Dirent

describe("notes file helpers", () => {
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
})
