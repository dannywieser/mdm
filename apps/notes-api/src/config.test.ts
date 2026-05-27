import { promises as fs } from "node:fs"
import path from "node:path"

import { AppConfigError, resolveNotesDirectory } from "./config"

jest.mock("node:fs", () => ({
  promises: {
    readFile: jest.fn()
  }
}))

const readFileMock = jest.mocked(fs.readFile)

describe("config", () => {
  test("resolves notes directory from noteRootDirectory and obsidianVault", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault"
      })
    )

    await expect(resolveNotesDirectory()).resolves.toBe(
      path.resolve("/notes-root", "vault")
    )
  })

  test("throws when config file is missing", async () => {
    readFileMock.mockRejectedValue(new Error("ENOENT"))

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json."
      )
    )
  })

  test("throws when config json is invalid", async () => {
    readFileMock.mockResolvedValue("{broken")

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError("app.config.json must contain valid JSON")
    )
  })

  test("throws when required config fields are missing", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root"
      })
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json requires a non-empty obsidianVault value"
      )
    )
  })
})
