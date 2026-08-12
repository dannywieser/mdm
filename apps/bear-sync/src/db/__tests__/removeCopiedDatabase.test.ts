import { promises as fs } from "node:fs"

import { removeCopiedDatabase } from "../removeCopiedDatabase"

vi.mock("node:fs", () => ({
  promises: { rm: vi.fn() },
}))

const rmMock = vi.mocked(fs.rm)

describe("removeCopiedDatabase", () => {
  test("removes the copied database's parent directory recursively", async () => {
    rmMock.mockResolvedValue(undefined)

    await removeCopiedDatabase("/mock-tmp/bear-sync-abc123/database.sqlite")

    expect(rmMock).toHaveBeenCalledWith("/mock-tmp/bear-sync-abc123", {
      force: true,
      recursive: true,
    })
  })
})
