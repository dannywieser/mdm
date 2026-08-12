import { promises as fs } from "node:fs"

import { loadSyncState } from "../loadSyncState"

vi.mock("node:fs", () => ({
  promises: { readFile: vi.fn() },
}))

const readFileMock = vi.mocked(fs.readFile)

describe("loadSyncState", () => {
  test("parses the state file when it exists", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ a: "2026-01-01T00:00:00.000Z" }))

    await expect(loadSyncState("/state.json")).resolves.toEqual({
      a: "2026-01-01T00:00:00.000Z",
    })
  })

  test("returns an empty state when the file does not exist", async () => {
    readFileMock.mockRejectedValue(Object.assign(new Error("missing"), { code: "ENOENT" }))

    await expect(loadSyncState("/state.json")).resolves.toEqual({})
  })

  test("rethrows non-ENOENT errors", async () => {
    readFileMock.mockRejectedValue(new Error("permission denied"))

    await expect(loadSyncState("/state.json")).rejects.toThrow("permission denied")
  })
})
