import { access } from "node:fs/promises"

import { assertDirectoryReadable } from "../assertDirectoryReadable"

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  constants: { R_OK: 4 },
}))

const accessMock = vi.mocked(access)

describe("assertDirectoryReadable", () => {
  test("resolves when the directory is readable", async () => {
    accessMock.mockResolvedValue(undefined)

    await expect(assertDirectoryReadable("/notes")).resolves.toBeUndefined()
    expect(accessMock).toHaveBeenCalledWith("/notes", expect.any(Number))
  })

  test("rejects with the underlying error when the directory is not readable", async () => {
    accessMock.mockRejectedValue(new Error("ENOENT: no such file or directory"))

    await expect(assertDirectoryReadable("/missing")).rejects.toThrow(
      "ENOENT: no such file or directory",
    )
  })
})
