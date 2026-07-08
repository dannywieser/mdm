import request from "supertest"

import { healthHandler } from "../handlers/health/health"
import { historyHandler } from "../handlers/history/history"
import { metaHandler } from "../handlers/meta/meta"
import { createApp } from "../server"

vi.mock("pino-http", () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) => { next() },
}))

vi.mock("../logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock("../handlers/health/health", () => ({
  healthHandler: vi.fn(),
}))
vi.mock("../handlers/meta/meta", () => ({
  metaHandler: vi.fn(),
}))
vi.mock("../handlers/history/history", () => ({
  historyHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)
const metaHandlerMock = vi.mocked(metaHandler)
const historyHandlerMock = vi.mocked(historyHandler)

describe("stats-service server interface", () => {
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

  test("wires GET /stats/meta to the meta handler", async () => {
    metaHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json({ totalNotes: 0 })
    })
    const app = createApp()

    const response = await request(app).get("/stats/meta")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ totalNotes: 0 })
    expect(metaHandlerMock).toHaveBeenCalledTimes(1)
  })

  test("wires GET /stats/history to the history handler", async () => {
    historyHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json([])
    })
    const app = createApp()

    const response = await request(app).get("/stats/history")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
    expect(historyHandlerMock).toHaveBeenCalledTimes(1)
  })
})
