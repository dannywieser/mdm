import express from "express"
import request from "supertest"
import { describe, expect, test, vi } from "vitest"

import type { ImageRedisClient } from "./images.types"

import { createImageHandler } from "./images"

const makeRedisClient = (cached: string | null = null): ImageRedisClient => ({
  get: vi.fn().mockResolvedValue(cached),
  set: vi.fn().mockResolvedValue("OK"),
})

const testConfig = {
  cacheTtlSeconds: 86400,
  imgproxyPathPrefix: "/imgproxy",
  imagesRoot: "/data/images",
  maxWidth: 1200,
}

const expectedUrl =
  "/imgproxy/unsafe/rs:fit:1200:0:0/plain/local:///data/images/daily/photo%20one.jpg"

describe("images handler", () => {
  test("returns 400 when path query is missing", async () => {
    const app = express()
    app.get("/images", createImageHandler(testConfig, makeRedisClient()))

    const response = await request(app).get("/images")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: "A valid local image path is required" })
  })

  test("redirects to cached url on cache hit without calling imgproxy", async () => {
    const redisClient = makeRedisClient(expectedUrl)
    const app = express()
    app.get("/images", createImageHandler(testConfig, redisClient))

    const response = await request(app)
      .get("/images")
      .query({ path: "daily/photo one.jpg" })

    expect(response.status).toBe(307)
    expect(response.header.location).toBe(expectedUrl)
    expect(redisClient.set).not.toHaveBeenCalled()
  })

  test("redirects and caches the url on cache miss", async () => {
    const redisClient = makeRedisClient(null)
    const app = express()
    app.get("/images", createImageHandler(testConfig, redisClient))

    const response = await request(app)
      .get("/images")
      .query({ path: "daily/photo one.jpg" })

    expect(response.status).toBe(307)
    expect(response.header.location).toBe(expectedUrl)
    expect(redisClient.set).toHaveBeenCalledWith(
      "image:daily/photo one.jpg:1200",
      expectedUrl,
      { EX: 86400 },
    )
  })
})
