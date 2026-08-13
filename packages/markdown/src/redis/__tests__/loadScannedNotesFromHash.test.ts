import type { ScannedNote } from "../../types"
import type { ScannedNotesRedisClient } from "../loadScannedNotesFromHash.types"

import { BEAR_NOTES_HASH_KEY } from "../../noteSync"
import { loadScannedNotesFromHash } from "../loadScannedNotesFromHash"

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
  tags: [],
  title: "note",
  ...overrides,
})

describe("loadScannedNotesFromHash", () => {
  test("parses every note stored in the bear notes hash", async () => {
    const noteA = createScannedNote({ id: "a" })
    const noteB = createScannedNote({ id: "b" })
    const hGetAll = vi.fn().mockResolvedValue({
      a: JSON.stringify(noteA),
      b: JSON.stringify(noteB),
    })
    const redisClient: ScannedNotesRedisClient = { hGetAll }

    const notes = await loadScannedNotesFromHash(redisClient)

    expect(hGetAll).toHaveBeenCalledWith(BEAR_NOTES_HASH_KEY)
    expect(notes).toEqual(expect.arrayContaining([noteA, noteB]))
    expect(notes).toHaveLength(2)
  })

  test("returns an empty array when the hash is empty", async () => {
    const redisClient: ScannedNotesRedisClient = { hGetAll: vi.fn().mockResolvedValue({}) }

    const notes = await loadScannedNotesFromHash(redisClient)

    expect(notes).toEqual([])
  })

  test("skips entries that fail to parse as JSON", async () => {
    const validNote = createScannedNote({ id: "valid" })
    const redisClient: ScannedNotesRedisClient = {
      hGetAll: vi.fn().mockResolvedValue({
        broken: "{not-json",
        valid: JSON.stringify(validNote),
      }),
    }

    const notes = await loadScannedNotesFromHash(redisClient)

    expect(notes).toEqual([validNote])
  })
})
