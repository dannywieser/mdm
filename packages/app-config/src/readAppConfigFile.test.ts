import { promises as fs } from "node:fs"

import { readAppConfigFile } from "./readAppConfigFile"

vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
  },
}))

const readFileMock = vi.mocked(fs.readFile)

describe("readAppConfigFile", () => {
  test("reads from APP_CONFIG_PATH when set", async () => {
    process.env.APP_CONFIG_PATH = "/custom/path/app.config.json"
    readFileMock.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await readAppConfigFile()

    expect(readFileMock).toHaveBeenCalledWith("/custom/path/app.config.json", "utf8")
    delete process.env.APP_CONFIG_PATH
  })

  test("returns the parsed contents of app.config.json", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await expect(readAppConfigFile()).resolves.toEqual({
      obsidianVault: "vault",
    })
  })

  test("throws when config file is missing", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" })
    readFileMock.mockRejectedValue(err)

    await expect(readAppConfigFile()).rejects.toEqual(
      new Error(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      ),
    )
  })

  test("throws when config file cannot be read", async () => {
    readFileMock.mockRejectedValue(new Error("EACCES"))

    await expect(readAppConfigFile()).rejects.toEqual(
      new Error("app.config.json must be readable"),
    )
  })

  test("throws when config json is invalid", async () => {
    readFileMock.mockResolvedValue("{broken")

    await expect(readAppConfigFile()).rejects.toEqual(
      new Error("app.config.json must contain valid JSON"),
    )
  })
})
