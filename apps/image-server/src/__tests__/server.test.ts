import request from "supertest"

import { healthHandler } from "../handlers/health/health"
import { createApp } from "../server"

vi.mock("../handlers/health/health", () => ({
  healthHandler: vi.fn(),
}))

const healthHandlerMock = vi.mocked(healthHandler)

describe("image-server app", () => {
  test("exposes health endpoint", async () => {
    healthHandlerMock.mockImplementation((_request, response) => {
      response.status(200).json({ status: "ok" })
    })

    const response = await request(createApp()).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
    expect(healthHandlerMock).toHaveBeenCalledTimes(1)
  })
})
