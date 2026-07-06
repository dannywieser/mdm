import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { access } from "node:fs/promises"

import { healthHandler } from "../health"

vi.mock("app-config", () => ({
  resolveNotesConfig: vi.fn(),
}))

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  constants: { R_OK: 4 },
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const accessMock = vi.mocked(access)

describe("healthHandler", () => {
  test("responds with 200 when the vault directory is readable", async () => {
    resolveNotesConfigMock.mockResolvedValue(
      createMockNotesConfig({ notesDirectory: "/notes" }),
    )
    accessMock.mockResolvedValue(undefined)
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }

    await healthHandler({} as never, response as never, vi.fn())

    expect(accessMock).toHaveBeenCalledWith("/notes", expect.any(Number))
    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })

  test("responds with 503 when the vault directory is not readable", async () => {
    resolveNotesConfigMock.mockResolvedValue(
      createMockNotesConfig({ notesDirectory: "/notes" }),
    )
    accessMock.mockRejectedValue(new Error("ENOENT: no such file or directory"))
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }

    await healthHandler({} as never, response as never, vi.fn())

    expect(response.status).toHaveBeenCalledWith(503)
    expect(json).toHaveBeenCalledWith({
      error: "ENOENT: no such file or directory",
      status: "error",
    })
  })

  test("responds with 503 when config cannot be resolved", async () => {
    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }

    await healthHandler({} as never, response as never, vi.fn())

    expect(response.status).toHaveBeenCalledWith(503)
    expect(json).toHaveBeenCalledWith({ error: "boom", status: "error" })
  })
})
