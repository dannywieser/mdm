import type { ScannedNote, ScannedNotesRedisClient } from "markdown"

import { loadScannedNotesFromHash } from "markdown"

import { loadBearNotes } from "../loadBearNotes"
import { getNotesRedisClient } from "../notesRedisClient"

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    loadScannedNotesFromHash: vi.fn(),
  }
})

vi.mock("../notesRedisClient", () => ({
  getNotesRedisClient: vi.fn(),
}))

const loadScannedNotesFromHashMock = vi.mocked(loadScannedNotesFromHash)
const getNotesRedisClientMock = vi.mocked(getNotesRedisClient)

describe("loadBearNotes", () => {
  test("loads notes via the redis client when one is available", async () => {
    const redisClient: ScannedNotesRedisClient = { hGetAll: vi.fn() }
    const notes = [{ id: "a" } as ScannedNote]
    getNotesRedisClientMock.mockReturnValue(redisClient)
    loadScannedNotesFromHashMock.mockResolvedValue(notes)

    const result = await loadBearNotes()

    expect(loadScannedNotesFromHashMock).toHaveBeenCalledWith(redisClient)
    expect(result).toBe(notes)
  })

  test("throws when no redis client is available", async () => {
    getNotesRedisClientMock.mockReturnValue(null)

    await expect(loadBearNotes()).rejects.toThrow(
      "notesSource is \"bear\" but no Redis client is available",
    )
  })
})
