import type { NotesRedisClient } from "../sources.types"

import { getNotesRedisClient, setNotesRedisClient } from "../notesRedisClient"

describe("notesRedisClient", () => {
  afterEach(() => {
    setNotesRedisClient(null)
  })

  test("returns null before a client has been set", () => {
    expect(getNotesRedisClient()).toBeNull()
  })

  test("returns the client passed to setNotesRedisClient", () => {
    const client: NotesRedisClient = { hGetAll: vi.fn() }

    setNotesRedisClient(client)

    expect(getNotesRedisClient()).toBe(client)
  })
})
