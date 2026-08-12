import express from "express"
import request from "supertest"

import { createHealthHandler } from "../health"

describe("health handler", () => {
  test("returns 200 when redis responds to ping", async () => {
    const redisClient = { ping: vi.fn().mockResolvedValue(undefined) }
    const app = express()
    app.get("/health", createHealthHandler(redisClient))

    const response = await request(app).get("/health")

    expect(redisClient.ping).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })

  test("returns 503 when redis ping fails", async () => {
    const redisClient = { ping: vi.fn().mockRejectedValue(new Error("connection closed")) }
    const app = express()
    app.get("/health", createHealthHandler(redisClient))

    const response = await request(app).get("/health")

    expect(response.status).toBe(503)
    expect(response.body).toEqual({
      error: "connection closed",
      status: "error",
    })
  })
})
