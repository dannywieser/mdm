import request from "supertest"

import type { HealthRedisClient } from "../handlers/health/health"
import type { SyncRedisClient } from "../handlers/sync/sync.types"

import { createApp } from "../server"

const createRedisClient = (): HealthRedisClient & SyncRedisClient => ({
  hDel: vi.fn().mockResolvedValue(0),
  hSet: vi.fn().mockResolvedValue(1),
  ping: vi.fn().mockResolvedValue(undefined),
})

describe("notes-ingest app", () => {
  test("exposes GET /health", async () => {
    const response = await request(createApp(createRedisClient())).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })

  test("exposes POST /notes/sync", async () => {
    const response = await request(createApp(createRedisClient()))
      .post("/notes/sync")
      .send({ deletedIds: [], upserts: [] })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ deleted: 0, upserted: 0 })
  })
})
