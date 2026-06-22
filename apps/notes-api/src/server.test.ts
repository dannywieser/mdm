import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { healthHandler } from "./handlers/health/health"
import { notesHandler } from "./handlers/notes/notes"
import { statsHandler } from "./handlers/stats/stats"
import { logger } from "./logger"
import { createApp, logStartupConfig } from "./server"

vi.mock("app-config", () => ({
  resolveNotesConfig: vi.fn(),
}))

vi.mock("mdm-util", () => ({
  toLoggableError: vi.fn(),
}))

vi.mock("pino-http", () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) => { next() },
}))

vi.mock("./logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock("./handlers/health/health", () => ({
  healthHandler: vi.fn(),
}))
vi.mock("./handlers/notes/notes", () => ({
  notesHandler: vi.fn(),
}))
vi.mock("./handlers/stats/stats", () => ({
  statsHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)
const notesHandlerMock = vi.mocked(notesHandler)
const statsHandlerMock = vi.mocked(statsHandler)
const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)

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

  test("wires GET /stats to the stats handler", async () => {
    statsHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json({ modifiedToday: 0, totalNotes: 0, views: [] })
    })
    const app = createApp()

    const response = await request(app).get("/stats")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ modifiedToday: 0, totalNotes: 0, views: [] })
    expect(statsHandlerMock).toHaveBeenCalledTimes(1)
  })

  test("logs the resolved notes config on startup", async () => {
    const config = createMockNotesConfig({
      attachmentsDirectory: "images",
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: "/notes",
      obsidianVault: "vault",
    })
    resolveNotesConfigMock.mockResolvedValue(config)

    await logStartupConfig()

    expect(logger.info).toHaveBeenCalledWith(
      { notesConfig: config },
      "Resolved notes config",
    )
  })

  test("logs startup config resolution failures", async () => {
    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })

    await logStartupConfig()

    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(toLoggableErrorMock).toHaveBeenCalledWith(expect.any(Error))
    expect(logger.error).toHaveBeenCalledWith(
      { error: { message: "boom", stack: "stack" } },
      "Unable to resolve notes config on startup",
    )
  })
})
