import { promises as fs } from "node:fs"

import { countFilesRecursive } from "./countFilesRecursive"

vi.mock("node:fs", () => ({
  promises: {
    readdir: vi.fn(),
  },
}))

const readdirMock = vi.mocked(fs.readdir)

const makeEntry = (name: string, type: "file" | "directory") => ({
  name,
  isFile: () => type === "file",
  isDirectory: () => type === "directory",
})

describe("countFilesRecursive", () => {
  test("counts files in a flat directory", async () => {
    readdirMock.mockResolvedValue([
      makeEntry("a.png", "file"),
      makeEntry("b.jpg", "file"),
      makeEntry("c.pdf", "file"),
    ] as never)

    await expect(countFilesRecursive("/attachments")).resolves.toBe(3)
  })

  test("counts files recursively across subdirectories", async () => {
    readdirMock
      .mockResolvedValueOnce([
        makeEntry("images", "directory"),
        makeEntry("root.txt", "file"),
      ] as never)
      .mockResolvedValueOnce([
        makeEntry("photo.png", "file"),
        makeEntry("icon.svg", "file"),
      ] as never)

    await expect(countFilesRecursive("/attachments")).resolves.toBe(3)
  })

  test("returns 0 when the directory does not exist", async () => {
    readdirMock.mockRejectedValue(new Error("ENOENT"))

    await expect(countFilesRecursive("/missing")).resolves.toBe(0)
  })

  test("returns 0 for an empty directory", async () => {
    readdirMock.mockResolvedValue([] as never)

    await expect(countFilesRecursive("/empty")).resolves.toBe(0)
  })
})
