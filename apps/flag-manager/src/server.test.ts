import type { RequestHandler } from "express"

import request from "supertest"

import { createFlagsHandler } from "./handlers/flags/flags"
import { healthHandler } from "./handlers/health/health"
import { createApp } from "./server"

jest.mock("./handlers/health/health", () => ({
  healthHandler: jest.fn(),
}))

jest.mock("./handlers/flags/flags", () => ({
  createFlagsHandler: jest.fn(),
}))

const healthHandlerMock = jest.mocked(healthHandler)
const createFlagsHandlerMock = jest.mocked(createFlagsHandler)

describe("flag-manager server interface", () => {
  const flagDefinitions = { read: {}, archived: { expiresInSeconds: 3600 } }

  test("wires GET /health to the health handler", async () => {
    healthHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json({ status: "ok" })
    })
    createFlagsHandlerMock.mockReturnValue(jest.fn())

    const app = createApp({ get: jest.fn(), set: jest.fn() }, flagDefinitions)

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
    expect(healthHandlerMock).toHaveBeenCalledTimes(1)
  })

  test("wires POST /flags/:id/:flag to the flags handler", async () => {
    const flagsHandler: RequestHandler = (_request, response) => {
      response.status(200).json({ id: "note-1", flag: "read", value: true })
    }
    createFlagsHandlerMock.mockReturnValue(flagsHandler)

    const app = createApp({ get: jest.fn(), set: jest.fn() }, flagDefinitions)

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

    const app = createApp({ get: jest.fn(), set: jest.fn() }, flagDefinitions)

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

    const app = createApp({ get: jest.fn(), set: jest.fn() }, flagDefinitions)

    const response = await request(app).patch("/flags/note-1/read")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: "note-1", flag: "read", value: false })
    expect(createFlagsHandlerMock).toHaveBeenCalledTimes(1)
  })
})
