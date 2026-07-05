import { promises as fs } from "node:fs"

import { countFilesByExtension } from "../countFilesByExtension"

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

describe("countFilesByExtension", () => {
  test("groups files in a flat directory by extension", async () => {
    readdirMock.mockResolvedValue([
      makeEntry("a.png", "file"),
      makeEntry("b.png", "file"),
      makeEntry("c.pdf", "file"),
    ] as never)

    await expect(countFilesByExtension("/attachments")).resolves.toEqual({
      pdf: 1,
      png: 2,
    })
  })

  test("counts files recursively across subdirectories", async () => {
    readdirMock
      .mockResolvedValueOnce([
        makeEntry("images", "directory"),
        makeEntry("root.pdf", "file"),
      ] as never)
      .mockResolvedValueOnce([
        makeEntry("photo.png", "file"),
        makeEntry("icon.png", "file"),
      ] as never)

    await expect(countFilesByExtension("/attachments")).resolves.toEqual({
      pdf: 1,
      png: 2,
    })
  })

  test("groups extensionless files under unknown", async () => {
    readdirMock.mockResolvedValue([makeEntry("LICENSE", "file")] as never)

    await expect(countFilesByExtension("/attachments")).resolves.toEqual({
      unknown: 1,
    })
  })

  test("lowercases extensions so casing does not fragment counts", async () => {
    readdirMock.mockResolvedValue([
      makeEntry("a.PNG", "file"),
      makeEntry("b.png", "file"),
    ] as never)

    await expect(countFilesByExtension("/attachments")).resolves.toEqual({
      png: 2,
    })
  })

  test("returns an empty map when the directory does not exist", async () => {
    readdirMock.mockRejectedValue(new Error("ENOENT"))

    await expect(countFilesByExtension("/missing")).resolves.toEqual({})
  })

  test("returns an empty map for an empty directory", async () => {
    readdirMock.mockResolvedValue([] as never)

    await expect(countFilesByExtension("/empty")).resolves.toEqual({})
  })
})
