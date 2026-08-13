import type { ScannedNotesRedisClient } from "markdown"

import { getNotesRedisClient, setNotesRedisClient } from "../notesRedisClient"

describe("notesRedisClient", () => {
  afterEach(() => {
    setNotesRedisClient(null)
  })

  test("returns null before a client has been set", () => {
    expect(getNotesRedisClient()).toBeNull()
  })

  test("returns the client passed to setNotesRedisClient", () => {
    const client: ScannedNotesRedisClient = { hGetAll: vi.fn() }

    setNotesRedisClient(client)

    expect(getNotesRedisClient()).toBe(client)
  })
})
