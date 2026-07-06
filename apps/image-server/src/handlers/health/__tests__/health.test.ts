import express from "express"
import { access } from "node:fs/promises"
import request from "supertest"

import { resolveImageProxyConfig } from "../../images/images"
import { healthHandler } from "../health"

vi.mock("../../images/images", () => ({
  resolveImageProxyConfig: vi.fn(),
}))

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  constants: { R_OK: 4 },
}))

const resolveImageProxyConfigMock = vi.mocked(resolveImageProxyConfig)
const accessMock = vi.mocked(access)

describe("health handler", () => {
  test("returns 200 when the images root is readable", async () => {
    resolveImageProxyConfigMock.mockReturnValue({
      cacheTtlSeconds: 86400,
      imagesRoot: "/data/notes",
      imgproxyEnabled: true,
      imgproxyPathPrefix: "/imgproxy",
      maxHeight: 1080,
      maxWidth: 1920,
    })
    accessMock.mockResolvedValue(undefined)
    const app = express()
    app.get("/health", healthHandler)

    const response = await request(app).get("/health")

    expect(accessMock).toHaveBeenCalledWith("/data/notes", expect.any(Number))
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })

  test("returns 503 when the images root is not readable", async () => {
    resolveImageProxyConfigMock.mockReturnValue({
      cacheTtlSeconds: 86400,
      imagesRoot: "/data/notes",
      imgproxyEnabled: true,
      imgproxyPathPrefix: "/imgproxy",
      maxHeight: 1080,
      maxWidth: 1920,
    })
    accessMock.mockRejectedValue(new Error("ENOENT: no such file or directory"))
    const app = express()
    app.get("/health", healthHandler)

    const response = await request(app).get("/health")

    expect(response.status).toBe(503)
    expect(response.body).toEqual({
      error: "ENOENT: no such file or directory",
      status: "error",
    })
  })
})
