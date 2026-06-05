import type { RequestHandler } from "express"

import request from "supertest"

import { habitHandler } from "./handlers/habit/habit"
import { healthHandler } from "./handlers/health/health"
import { createApp } from "./server"

vi.mock("./handlers/health/health", () => ({
  healthHandler: vi.fn(),
}))

vi.mock("./handlers/habit/habit", () => ({
  habitHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)
const habitHandlerMock = vi.mocked(habitHandler)

describe("habit-tracker server interface", () => {
  test("wires GET /health to the health handler", async () => {
    healthHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json({ status: "ok" })
    })

    const app = createApp()

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
    expect(healthHandlerMock).toHaveBeenCalledTimes(1)
  })

  test("wires GET /habit/:key to the habit handler", async () => {
    const handler: RequestHandler = (_request, response) => {
      response.status(200).json({})
    }
    habitHandlerMock.mockImplementation(handler)

    const app = createApp()

    const response = await request(app).get("/habit/morning-routine")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({})
    expect(habitHandlerMock).toHaveBeenCalledTimes(1)
  })
})
