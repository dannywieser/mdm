import request from "supertest"

import { healthHandler } from "../handlers/health/health"
import { notesHandler } from "../handlers/notes/notes"
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
vi.mock("../handlers/notes/notes", () => ({
  notesHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)
const notesHandlerMock = vi.mocked(notesHandler)

describe("notes-api server interface", () => {
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

  test("wires GET /notes to the notes handler", async () => {
    notesHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json({ notes: [] })
    })
    const app = createApp()

    const response = await request(app).get("/notes")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ notes: [] })
    expect(notesHandlerMock).toHaveBeenCalledTimes(1)
  })
})
