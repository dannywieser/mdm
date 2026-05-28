import express from "express"
import request from "supertest"

import { healthHandler } from "./health"

describe("health handler", () => {
  test("returns ok status", async () => {
    const app = express()
    app.get("/health", healthHandler)

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })
})
