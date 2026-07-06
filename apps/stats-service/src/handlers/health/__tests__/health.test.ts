import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import { assertDirectoryReadable } from "mdm-util/node"

import { healthHandler } from "../health"

vi.mock("app-config", () => ({
  resolveNotesConfig: vi.fn(),
}))

vi.mock("mdm-util/node", () => ({
  assertDirectoryReadable: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const assertDirectoryReadableMock = vi.mocked(assertDirectoryReadable)

describe("healthHandler", () => {
  test("responds with 200 when the vault directory is readable", async () => {
    resolveNotesConfigMock.mockResolvedValue(
      createMockNotesConfig({ notesDirectory: "/notes" }),
    )
    assertDirectoryReadableMock.mockResolvedValue(undefined)
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }

    await healthHandler({} as never, response as never, vi.fn())

    expect(assertDirectoryReadableMock).toHaveBeenCalledWith("/notes")
    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })

  test("responds with 503 when the vault directory is not readable", async () => {
    resolveNotesConfigMock.mockResolvedValue(
      createMockNotesConfig({ notesDirectory: "/notes" }),
    )
    assertDirectoryReadableMock.mockRejectedValue(
      new Error("ENOENT: no such file or directory"),
    )
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
