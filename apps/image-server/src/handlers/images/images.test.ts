import express from "express"
import request from "supertest"

import { createImageHandler } from "./images"

describe("images handler", () => {
  test("returns 400 when path query is missing", async () => {
    const app = express()
    app.get(
      "/images",
      createImageHandler({
        imgproxyBaseUrl: "http://imgproxy:8080",
        imagesRoot: "/data/images",
        maxWidth: 1200,
      }),
    )

    const response = await request(app).get("/images")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: "A valid local image path is required" })
  })

  test("proxies local image paths through imgproxy", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(Buffer.from("image-data"), {
          headers: {
            "cache-control": "public,max-age=60",
            "content-type": "image/jpeg",
          },
          status: 200,
        }),
      )

    const app = express()
    app.get(
      "/images",
      createImageHandler({
        imgproxyBaseUrl: "http://imgproxy:8080",
        imagesRoot: "/data/images",
        maxWidth: 1200,
      }),
    )

    const response = await request(app)
      .get("/images")
      .query({ path: "daily/photo one.jpg" })

    expect(fetchMock).toHaveBeenCalledWith(
      "http://imgproxy:8080/unsafe/rs:fit:1200:0:0/plain/local:///data/images/daily/photo%20one.jpg",
    )
    expect(response.status).toBe(200)
    expect(response.header["content-type"]).toBe("image/jpeg")
    expect(response.header["cache-control"]).toBe("public,max-age=60")
    expect(Buffer.from(response.body as Uint8Array).toString("utf8")).toBe(
      "image-data",
    )

    fetchMock.mockRestore()
  })
})
