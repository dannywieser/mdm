import type { ScannedNote } from "markdown"

import { BEAR_NOTES_HASH_KEY } from "markdown"

import type { NotesRedisClient } from "../sources.types"

import { createRedisNoteSource } from "../redisNoteSource"

vi.mock("../../../../logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const createScannedNote = (overrides: Partial<ScannedNote> = {}): ScannedNote => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  folder: "",
  frontmatter: null,
  fullPath: "note",
  fullText: "",
  id: "note",
  modifiedDate: "2026-01-01T00:00:00.000Z",
  obsidianUrl: "bear://x-callback-url/open-note?id=note",
  title: "note",
  ...overrides,
})

describe("createRedisNoteSource", () => {
  test("parses every note stored in the bear notes hash", async () => {
    const noteA = createScannedNote({ id: "a" })
    const noteB = createScannedNote({ id: "b" })
    const hGetAll = vi.fn().mockResolvedValue({
      a: JSON.stringify(noteA),
      b: JSON.stringify(noteB),
    })
    const redisClient: NotesRedisClient = { hGetAll }

    const notes = await createRedisNoteSource(redisClient).listNotes()

    expect(hGetAll).toHaveBeenCalledWith(BEAR_NOTES_HASH_KEY)
    expect(notes).toEqual(expect.arrayContaining([noteA, noteB]))
    expect(notes).toHaveLength(2)
  })

  test("returns an empty array when the hash is empty", async () => {
    const redisClient: NotesRedisClient = { hGetAll: vi.fn().mockResolvedValue({}) }

    const notes = await createRedisNoteSource(redisClient).listNotes()

    expect(notes).toEqual([])
  })

  test("skips entries that fail to parse as JSON", async () => {
    const validNote = createScannedNote({ id: "valid" })
    const redisClient: NotesRedisClient = {
      hGetAll: vi.fn().mockResolvedValue({
        broken: "{not-json",
        valid: JSON.stringify(validNote),
      }),
    }

    const notes = await createRedisNoteSource(redisClient).listNotes()

    expect(notes).toEqual([validNote])
  })
})
