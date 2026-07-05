import type { RequestHandler } from "express"

import request from "supertest"

import { habitDetailHandler } from "../handlers/habit-detail/habit-detail"
import { habitsHandler } from "../handlers/habits/habits"
import { healthHandler } from "../handlers/health/health"
import { createApp } from "../server"

vi.mock("../handlers/health/health", () => ({
  healthHandler: vi.fn(),
}))

vi.mock("../handlers/habit-detail/habit-detail", () => ({
  habitDetailHandler: vi.fn(),
}))

vi.mock("../handlers/habits/habits", () => ({
  habitsHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)
const habitDetailHandlerMock = vi.mocked(habitDetailHandler)
const habitsHandlerMock = vi.mocked(habitsHandler)

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

  test("wires GET /habits/:id to the habit detail handler", async () => {
    const handler: RequestHandler = (_request, response) => {
      response.status(200).json({})
    }
    habitDetailHandlerMock.mockImplementation(handler)

    const app = createApp()

    const response = await request(app).get("/habits/morning-routine")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({})
    expect(habitDetailHandlerMock).toHaveBeenCalledTimes(1)
  })

  test("wires GET /habits to the habits handler", async () => {
    const handler: RequestHandler = (_request, response) => {
      response.status(200).json([])
    }
    habitsHandlerMock.mockImplementation(handler)

    const app = createApp()

    const response = await request(app).get("/habits")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
    expect(habitsHandlerMock).toHaveBeenCalledTimes(1)
  })
})
