import { promises as fs } from "node:fs"
import path from "node:path"

import {
  AppConfigError,
  clearConfigCache,
  resolveNotesConfig,
  resolveNotesDirectory
} from "./config"

jest.mock("node:fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn()
  }
}))

const accessMock = jest.mocked(fs.access)
const readFileMock = jest.mocked(fs.readFile)

describe("config", () => {
  beforeEach(() => {
    accessMock.mockResolvedValue(undefined)
    clearConfigCache()
  })

  test("resolves notes directory from noteRootDirectory and obsidianVault", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault"
      })
    )

    await expect(resolveNotesDirectory()).resolves.toBe(
      path.resolve("/notes-root", "vault")
    )
  })

  test("resolves notes config with directory and obsidian vault", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD", "YY/MM/DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
        views: [
          {
            filters: {
              folder: "downtime",
              "frontmatter.type": "book"
            },
            name: "books"
          }
        ]
      })
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      dateFormats: ["YYYY.MM.DD", "YY/MM/DD"],
      notesDirectory: path.resolve("/notes-root", "vault"),
      obsidianVault: "vault",
      views: [
        {
          filters: {
            folder: "downtime",
            "frontmatter.type": "book"
          },
          name: "books"
        }
      ]
    })
  })

  test("defaults date formats to an empty array when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault"
      })
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      dateFormats: [],
      notesDirectory: path.resolve("/notes-root", "vault"),
      obsidianVault: "vault",
      views: []
    })
  })

  test("defaults views to an empty array when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault"
      })
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: path.resolve("/notes-root", "vault"),
      obsidianVault: "vault",
      views: []
    })
  })

  test("throws when config file is missing", async () => {
    accessMock.mockRejectedValue(new Error("ENOENT"))

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

  test("throws when config file cannot be read", async () => {
    readFileMock.mockRejectedValue(new Error("EACCES"))

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError("app.config.json must be readable")
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

  test("throws when dateFormats is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD", ""],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault"
      })
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json dateFormats must be an array of non-empty strings"
      )
    )
  })

  test("throws when views is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
        views: [
          {
            filters: {
              folder: "downtime"
            }
          }
        ]
      })
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json views must be an array of objects with non-empty name and string filters"
      )
    )
  })

  test("throws when noteRootDirectory is missing", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault"
      })
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json requires a non-empty noteRootDirectory value"
      )
    )
  })

  test("caches resolved notes directory after first load", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault"
      })
    )

    await resolveNotesDirectory()
    await resolveNotesDirectory()

    expect(accessMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledTimes(1)
  })
})
