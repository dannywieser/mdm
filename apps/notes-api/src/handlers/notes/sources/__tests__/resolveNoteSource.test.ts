import { createMockNotesConfig } from "app-config/testing"

import type { NotesRedisClient } from "../sources.types"

import { createFileNoteSource } from "../fileNoteSource"
import { createRedisNoteSource } from "../redisNoteSource"
import { resolveNoteSource } from "../resolveNoteSource"

vi.mock("../fileNoteSource", () => ({
  createFileNoteSource: vi.fn(() => ({ listNotes: vi.fn() })),
}))

vi.mock("../redisNoteSource", () => ({
  createRedisNoteSource: vi.fn(() => ({ listNotes: vi.fn() })),
}))

const createFileNoteSourceMock = vi.mocked(createFileNoteSource)
const createRedisNoteSourceMock = vi.mocked(createRedisNoteSource)

describe("resolveNoteSource", () => {
  test("returns the file source when notesSource is obsidian", () => {
    const notesConfig = createMockNotesConfig({ notesSource: "obsidian" })

    resolveNoteSource(notesConfig, null)

    expect(createFileNoteSourceMock).toHaveBeenCalledWith(notesConfig)
    expect(createRedisNoteSourceMock).not.toHaveBeenCalled()
  })

  test("returns the redis source when notesSource is bear and a client is available", () => {
    const notesConfig = createMockNotesConfig({ notesSource: "bear" })
    const redisClient: NotesRedisClient = { hGetAll: vi.fn() }

    resolveNoteSource(notesConfig, redisClient)

    expect(createRedisNoteSourceMock).toHaveBeenCalledWith(redisClient)
    expect(createFileNoteSourceMock).not.toHaveBeenCalled()
  })

  test("throws when notesSource is bear but no redis client is available", () => {
    const notesConfig = createMockNotesConfig({ notesSource: "bear" })

    expect(() => resolveNoteSource(notesConfig, null)).toThrow(
      "notesSource is \"bear\" but no Redis client is available",
    )
  })
})
