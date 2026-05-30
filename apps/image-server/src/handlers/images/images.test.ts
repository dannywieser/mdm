import express from "express"
import request from "supertest"

import { createImageHandler } from "./images"

const baseConfig = {
  imgproxyEnabled: true,
  imgproxyPathPrefix: "/imgproxy",
  imagesRoot: "/data/images",
  maxWidth: 1200,
}

describe("images handler", () => {
  test("returns 400 when path query is missing", async () => {
    const app = express()
    app.get("/images", createImageHandler(baseConfig))

    const response = await request(app).get("/images")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: "A valid local image path is required" })
  })

  test("redirects local image paths through imgproxy", async () => {
    const app = express()
    app.get("/images", createImageHandler(baseConfig))

    const response = await request(app)
      .get("/images")
      .query({ path: "daily/photo one.jpg" })

    expect(response.status).toBe(307)
    expect(response.header.location).toBe(
      "/imgproxy/unsafe/rs:fit:1200:0:0/plain/local:///data/images/daily/photo%20one.jpg",
    )
  })

  test("serves file directly when imgproxy is disabled", async () => {
    const app = express()
    app.get(
      "/images",
      createImageHandler({ ...baseConfig, imgproxyEnabled: false, imagesRoot: __dirname }),
    )

    const response = await request(app)
      .get("/images")
      .query({ path: "images.ts" })

    expect(response.status).toBe(200)
  })
})
