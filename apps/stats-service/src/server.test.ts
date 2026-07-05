import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { healthHandler } from "./handlers/health/health"
import { metaHandler } from "./handlers/meta/meta"
import { logger } from "./logger"
import { createApp, logStartupConfig } from "./server"

vi.mock("app-config", async () => {
  const actualConfig =
    await vi.importActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: vi.fn(),
  }
})

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
vi.mock("./handlers/meta/meta", () => ({
  metaHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)
const metaHandlerMock = vi.mocked(metaHandler)
const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)

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
