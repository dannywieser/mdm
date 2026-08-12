import { promises as fs } from "node:fs"

import type { BearDatabase } from "../db.types"

import { backupDatabaseFile } from "../backupDatabaseFile"
import { openBearDatabase } from "../openBearDatabase"

vi.mock("node:fs", () => ({
  promises: { mkdtemp: vi.fn() },
}))

vi.mock("../openBearDatabase", () => ({
  openBearDatabase: vi.fn(),
}))

const mkdtempMock = vi.mocked(fs.mkdtemp)
const openBearDatabaseMock = vi.mocked(openBearDatabase)

describe("backupDatabaseFile", () => {
  beforeEach(() => {
    mkdtempMock.mockResolvedValue("/mock-tmp/bear-sync-abc123")
  })

  test("opens the live database read-only and backs it up into a fresh temp directory", async () => {
    const backup = vi.fn().mockResolvedValue(undefined)
    const close = vi.fn()
    const db: BearDatabase = { backup, close, prepare: vi.fn() }
    openBearDatabaseMock.mockReturnValue(db)

    const destPath = await backupDatabaseFile("/source/database.sqlite")

    expect(openBearDatabaseMock).toHaveBeenCalledWith("/source/database.sqlite")
    expect(backup).toHaveBeenCalledWith("/mock-tmp/bear-sync-abc123/database.sqlite")
    expect(destPath).toBe("/mock-tmp/bear-sync-abc123/database.sqlite")
  })

  test("closes the source connection even when backup fails", async () => {
    const close = vi.fn()
    const db: BearDatabase = {
      backup: vi.fn().mockRejectedValue(new Error("database is locked")),
      close,
      prepare: vi.fn(),
    }
    openBearDatabaseMock.mockReturnValue(db)

    await expect(backupDatabaseFile("/source/database.sqlite")).rejects.toThrow(
      "database is locked",
    )
    expect(close).toHaveBeenCalled()
  })
})
