import type { ScannedNote } from "markdown"

import express from "express"
import { BEAR_NOTES_HASH_KEY } from "markdown"
import request from "supertest"

import type { SyncRedisClient } from "../sync.types"

import { createSyncHandler } from "../sync"

vi.mock("../../../logger", () => ({
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
  tags: [],
  title: "note",
  ...overrides,
})

const createApp = (redisClient: SyncRedisClient) => {
  const app = express()
  app.use(express.json())
  app.post("/notes/sync", createSyncHandler(redisClient))
  return app
}

describe("createSyncHandler", () => {
  test("writes upserts and deletes into the bear notes hash", async () => {
    const redisClient: SyncRedisClient = {
      hDel: vi.fn().mockResolvedValue(1),
      hSet: vi.fn().mockResolvedValue(1),
    }
    const note = createScannedNote({ id: "note-1" })

    const response = await request(createApp(redisClient))
      .post("/notes/sync")
      .send({ deletedIds: ["old-id"], upserts: [note] })

    expect(redisClient.hSet).toHaveBeenCalledWith(
      BEAR_NOTES_HASH_KEY,
      "note-1",
      JSON.stringify(note),
    )
    expect(redisClient.hDel).toHaveBeenCalledWith(BEAR_NOTES_HASH_KEY, ["old-id"])
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ deleted: 1, upserted: 1 })
  })

  test("skips hDel when there are no deletions", async () => {
    const redisClient: SyncRedisClient = {
      hDel: vi.fn().mockResolvedValue(0),
      hSet: vi.fn().mockResolvedValue(1),
    }

    const response = await request(createApp(redisClient))
      .post("/notes/sync")
      .send({ deletedIds: [], upserts: [createScannedNote()] })

    expect(redisClient.hDel).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  test("returns 400 for an invalid payload without touching redis", async () => {
    const redisClient: SyncRedisClient = { hDel: vi.fn(), hSet: vi.fn() }

    const response = await request(createApp(redisClient))
      .post("/notes/sync")
      .send({ deletedIds: [], upserts: [{ title: "no id" }] })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: "upserts must be an array of valid ScannedNote objects",
    })
    expect(redisClient.hSet).not.toHaveBeenCalled()
  })

  test("returns 500 when redis write fails", async () => {
    const redisClient: SyncRedisClient = {
      hDel: vi.fn(),
      hSet: vi.fn().mockRejectedValue(new Error("connection closed")),
    }

    const response = await request(createApp(redisClient))
      .post("/notes/sync")
      .send({ deletedIds: [], upserts: [createScannedNote()] })

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to apply note sync payload" })
  })
})
