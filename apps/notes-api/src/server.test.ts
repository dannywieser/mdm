import request from "supertest"

import { resolveNotesConfig } from "./config"
import { healthHandler } from "./handlers/health/health"
import { notesHandler } from "./handlers/notes/notes"
import { createApp, logStartupConfig } from "./server"

jest.mock("./config", () => ({
  resolveNotesConfig: jest.fn()
}))

jest.mock("./handlers/health/health", () => ({
  healthHandler: jest.fn()
}))
jest.mock("./handlers/notes/notes", () => ({
  notesHandler: jest.fn()
}))

const healthHandlerMock = jest.mocked(healthHandler)
const notesHandlerMock = jest.mocked(notesHandler)
const resolveNotesConfigMock = jest.mocked(resolveNotesConfig)

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

  test("logs the resolved notes config on startup", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation()

    resolveNotesConfigMock.mockResolvedValue({
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: "/notes",
      obsidianVault: "vault"
    })

    await logStartupConfig()

    expect(logSpy).toHaveBeenCalledWith("Resolved notes config", {
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: "/notes",
      obsidianVault: "vault"
    })

    logSpy.mockRestore()
  })

  test("logs startup config resolution failures", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation()

    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))

    await logStartupConfig()

    expect(errorSpy).toHaveBeenCalledWith(
      "Unable to resolve notes config on startup",
      expect.objectContaining({
        message: "boom"
      })
    )

    errorSpy.mockRestore()
  })
})
