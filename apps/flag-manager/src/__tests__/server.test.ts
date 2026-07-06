import type { RequestHandler } from "express"

import request from "supertest"

import { createFlagsHandler } from "../handlers/flags/flags"
import { createHealthHandler } from "../handlers/health/health"
import { createApp } from "../server"

vi.mock("../handlers/health/health", () => ({
  createHealthHandler: vi.fn(),
}))

vi.mock("../handlers/flags/flags", () => ({
  createFlagsHandler: vi.fn(),
}))

const createHealthHandlerMock = vi.mocked(createHealthHandler)
const createFlagsHandlerMock = vi.mocked(createFlagsHandler)

describe("flag-manager server interface", () => {
  const flagDefinitions = { read: {}, archived: { expiresInDays: 1 } }
  const redisClient = { get: vi.fn(), ping: vi.fn(), set: vi.fn() }

  beforeEach(() => {
    createHealthHandlerMock.mockReturnValue(vi.fn())
  })

  test("wires GET /health to the health handler", async () => {
    createHealthHandlerMock.mockReturnValue((_request, response) => {
      response.status(200).json({ status: "ok" })
    })
    createFlagsHandlerMock.mockReturnValue(vi.fn())

    const app = createApp(redisClient, flagDefinitions)

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
    expect(createHealthHandlerMock).toHaveBeenCalledWith(redisClient)
  })

  test("wires POST /flags/:id/:flag to the flags handler", async () => {
    const flagsHandler: RequestHandler = (_request, response) => {
      response.status(200).json({ id: "note-1", flag: "read", value: true })
    }
    createFlagsHandlerMock.mockReturnValue(flagsHandler)

    const app = createApp(redisClient, flagDefinitions)

    const response = await request(app).post("/flags/note-1/read")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: "note-1", flag: "read", value: true })
    expect(createFlagsHandlerMock).toHaveBeenCalledTimes(1)
    expect(createFlagsHandlerMock).toHaveBeenCalledWith(
      expect.any(Object),
      flagDefinitions,
    )
  })

  test("wires GET /flags/:id/:flag to the flags handler", async () => {
    const flagsHandler: RequestHandler = (_request, response) => {
      response.status(200).json({ id: "note-1", flag: "read", value: true })
    }
    createFlagsHandlerMock.mockReturnValue(flagsHandler)

    const app = createApp(redisClient, flagDefinitions)

    const response = await request(app).get("/flags/note-1/read")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: "note-1", flag: "read", value: true })
    expect(createFlagsHandlerMock).toHaveBeenCalledTimes(1)
  })

  test("wires PATCH /flags/:id/:flag to the flags handler", async () => {
    const flagsHandler: RequestHandler = (_request, response) => {
      response.status(200).json({ id: "note-1", flag: "read", value: false })
    }
    createFlagsHandlerMock.mockReturnValue(flagsHandler)

    const app = createApp(redisClient, flagDefinitions)

    const response = await request(app).patch("/flags/note-1/read")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: "note-1", flag: "read", value: false })
    expect(createFlagsHandlerMock).toHaveBeenCalledTimes(1)
  })
})
