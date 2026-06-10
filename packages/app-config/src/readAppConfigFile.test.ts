import { promises as fs } from "node:fs"

import { AppConfigError } from "./AppConfigError"
import { readAppConfigFile } from "./readAppConfigFile"

vi.mock("node:fs", () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
  },
}))

const accessMock = vi.mocked(fs.access)
const readFileMock = vi.mocked(fs.readFile)

describe("readAppConfigFile", () => {
  beforeEach(() => {
    accessMock.mockResolvedValue(undefined)
  })

  test("returns the parsed contents of app.config.json", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await expect(readAppConfigFile()).resolves.toEqual({
      obsidianVault: "vault",
    })
  })

  test("throws when config file is missing", async () => {
    accessMock.mockRejectedValue(new Error("ENOENT"))

    await expect(readAppConfigFile()).rejects.toEqual(
      new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      ),
    )
  })

  test("throws when config file cannot be read", async () => {
    readFileMock.mockRejectedValue(new Error("EACCES"))

    await expect(readAppConfigFile()).rejects.toEqual(
      new AppConfigError("app.config.json must be readable"),
    )
  })

  test("throws when config json is invalid", async () => {
    readFileMock.mockResolvedValue("{broken")

    await expect(readAppConfigFile()).rejects.toEqual(
      new AppConfigError("app.config.json must contain valid JSON"),
    )
  })
})
