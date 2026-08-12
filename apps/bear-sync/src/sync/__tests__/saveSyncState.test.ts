import { promises as fs } from "node:fs"

import { saveSyncState } from "../saveSyncState"

vi.mock("node:fs", () => ({
  promises: { mkdir: vi.fn(), writeFile: vi.fn() },
}))

const mkdirMock = vi.mocked(fs.mkdir)
const writeFileMock = vi.mocked(fs.writeFile)

describe("saveSyncState", () => {
  test("creates the parent directory and writes formatted json", async () => {
    mkdirMock.mockResolvedValue(undefined)
    writeFileMock.mockResolvedValue(undefined)

    await saveSyncState("/home/user/.mdm-bear-sync/state.json", { a: "2026-01-01T00:00:00.000Z" })

    expect(mkdirMock).toHaveBeenCalledWith("/home/user/.mdm-bear-sync", { recursive: true })
    expect(writeFileMock).toHaveBeenCalledWith(
      "/home/user/.mdm-bear-sync/state.json",
      JSON.stringify({ a: "2026-01-01T00:00:00.000Z" }, null, 2),
      "utf8",
    )
  })
})
