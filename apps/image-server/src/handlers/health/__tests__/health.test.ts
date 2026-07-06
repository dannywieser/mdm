import express from "express"
import { assertDirectoryReadable } from "mdm-util/node"
import request from "supertest"

import { resolveImageProxyConfig } from "../../images/images"
import { healthHandler } from "../health"

vi.mock("../../images/images", () => ({
  resolveImageProxyConfig: vi.fn(),
}))

vi.mock("mdm-util/node", () => ({
  assertDirectoryReadable: vi.fn(),
}))

const resolveImageProxyConfigMock = vi.mocked(resolveImageProxyConfig)
const assertDirectoryReadableMock = vi.mocked(assertDirectoryReadable)

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
    assertDirectoryReadableMock.mockResolvedValue(undefined)
    const app = express()
    app.get("/health", healthHandler)

    const response = await request(app).get("/health")

    expect(assertDirectoryReadableMock).toHaveBeenCalledWith("/data/notes")
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
    assertDirectoryReadableMock.mockRejectedValue(
      new Error("ENOENT: no such file or directory"),
    )
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
