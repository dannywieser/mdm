import { promises as fs } from "node:fs"

import { copyDatabaseFile } from "../copyDatabaseFile"

vi.mock("node:fs", () => ({
  promises: {
    copyFile: vi.fn(),
    mkdtemp: vi.fn(),
  },
}))

const copyFileMock = vi.mocked(fs.copyFile)
const mkdtempMock = vi.mocked(fs.mkdtemp)

describe("copyDatabaseFile", () => {
  beforeEach(() => {
    mkdtempMock.mockResolvedValue("/mock-tmp/bear-sync-abc123")
    copyFileMock.mockResolvedValue(undefined)
  })

  test("copies the main database file into a fresh temp directory", async () => {
    const destPath = await copyDatabaseFile("/source/database.sqlite")

    expect(copyFileMock).toHaveBeenCalledWith(
      "/source/database.sqlite",
      "/mock-tmp/bear-sync-abc123/database.sqlite",
    )
    expect(destPath).toBe("/mock-tmp/bear-sync-abc123/database.sqlite")
  })

  test("also copies -wal and -shm companion files when present", async () => {
    await copyDatabaseFile("/source/database.sqlite")

    expect(copyFileMock).toHaveBeenCalledWith(
      "/source/database.sqlite-wal",
      "/mock-tmp/bear-sync-abc123/database.sqlite-wal",
    )
    expect(copyFileMock).toHaveBeenCalledWith(
      "/source/database.sqlite-shm",
      "/mock-tmp/bear-sync-abc123/database.sqlite-shm",
    )
  })

  test("ignores ENOENT when a companion file does not exist", async () => {
    copyFileMock.mockImplementation((source) => {
      if (String(source).endsWith("-wal")) {
        return Promise.reject(Object.assign(new Error("missing"), { code: "ENOENT" }))
      }
      return Promise.resolve(undefined)
    })

    await expect(copyDatabaseFile("/source/database.sqlite")).resolves.toBe(
      "/mock-tmp/bear-sync-abc123/database.sqlite",
    )
  })

  test("rethrows non-ENOENT copy errors", async () => {
    copyFileMock.mockImplementation((source) => {
      if (String(source).endsWith("-wal")) {
        return Promise.reject(new Error("permission denied"))
      }
      return Promise.resolve(undefined)
    })

    await expect(copyDatabaseFile("/source/database.sqlite")).rejects.toThrow(
      "permission denied",
    )
  })
})
