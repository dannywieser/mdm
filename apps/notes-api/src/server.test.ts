import request from "supertest"

import { createApp } from "./server"

describe("notes-api health endpoint", () => {
  test("returns service health status", async () => {
    const app = createApp()

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })
})
