import request from "supertest"

import { healthHandler } from "./handlers/health/health"
import { notesHandler } from "./handlers/notes/notes"
import { createApp } from "./server"

jest.mock("./handlers/health/health", () => ({
  healthHandler: jest.fn()
}))
jest.mock("./handlers/notes/notes", () => ({
  notesHandler: jest.fn()
}))

const healthHandlerMock = jest.mocked(healthHandler)
const notesHandlerMock = jest.mocked(notesHandler)

describe("createApp", () => {
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
