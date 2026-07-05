import request from "supertest"

import { createApp } from "../server"

describe("image-server app", () => {
  test("exposes health endpoint", async () => {
    const response = await request(createApp()).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })
})
