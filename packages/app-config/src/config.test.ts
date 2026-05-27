import {
  isNonEmptyString,
  isStringArray,
  isStringRecord,
  isValidTimezone,
} from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import {
  AppConfigError,
  clearConfigCache,
  resolveNotesConfig,
  resolveNotesDirectory,
} from "./index"

jest.mock("node:fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}))

jest.mock("mdm-util", () => ({
  isNonEmptyString: jest.fn(),
  isStringArray: jest.fn(),
  isStringRecord: jest.fn(),
  isValidTimezone: jest.fn(),
}))

const accessMock = jest.mocked(fs.access)
const isNonEmptyStringMock = jest.mocked(isNonEmptyString)
const isStringArrayMock = jest.mocked(isStringArray)
const isStringRecordMock = jest.mocked(isStringRecord)
const isValidTimezoneMock = jest.mocked(isValidTimezone)
const readFileMock = jest.mocked(fs.readFile)

describe("config", () => {
  beforeEach(() => {
    accessMock.mockResolvedValue(undefined)
    clearConfigCache()

    isNonEmptyStringMock.mockImplementation(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )

    isStringArrayMock.mockImplementation(
      (value): value is string[] =>
        Array.isArray(value) &&
        value.every(
          (entry): entry is string =>
            typeof entry === "string" && entry.trim().length > 0,
        ),
    )

    isStringRecordMock.mockImplementation(
      (value): value is Record<string, string> =>
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.entries(value as Record<string, unknown>).every(
          ([key, entryValue]) =>
            typeof key === "string" &&
            key.trim().length > 0 &&
            typeof entryValue === "string" &&
            entryValue.trim().length > 0,
        ),
    )

    isValidTimezoneMock.mockImplementation((value) =>
      ["UTC", "America/Toronto"].includes(value),
    )
  })

  test("resolves notes directory from noteRootDirectory and obsidianVault", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).resolves.toBe(
      path.resolve("/notes-root", "vault"),
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
              "frontmatter.type": "book",
            },
            name: "books",
          },
        ],
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      dateFormats: ["YYYY.MM.DD", "YY/MM/DD"],
      notesDirectory: path.resolve("/notes-root", "vault"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          filters: {
            folder: "downtime",
            "frontmatter.type": "book",
          },
          name: "books",
        },
      ],
    })
  })

  test("defaults date formats to an empty array when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      dateFormats: [],
      notesDirectory: path.resolve("/notes-root", "vault"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
  })

  test("defaults views to an empty array when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: path.resolve("/notes-root", "vault"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
  })

  test("includes the configured timezone in resolved config", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
        timezone: "America/Toronto",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      timezone: "America/Toronto",
    })
  })

  test("defaults timezone to UTC when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      timezone: "UTC",
    })
  })

  test("throws when timezone is not a valid IANA identifier", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
        timezone: "Not/A/Timezone",
      }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new AppConfigError(
        "app.config.json timezone must be a valid IANA timezone identifier",
      ),
    )
  })

  test("throws when config file is missing", async () => {
    accessMock.mockRejectedValue(new Error("ENOENT"))

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      ),
    )
  })

  test("throws when config json is invalid", async () => {
    readFileMock.mockResolvedValue("{broken")

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError("app.config.json must contain valid JSON"),
    )
  })

  test("throws when config file cannot be read", async () => {
    readFileMock.mockRejectedValue(new Error("EACCES"))

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError("app.config.json must be readable"),
    )
  })

  test("throws when required config fields are missing", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json requires a non-empty obsidianVault value",
      ),
    )
  })

  test("throws when dateFormats is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD", ""],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json dateFormats must be an array of non-empty strings",
      ),
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
              folder: "downtime",
            },
          },
        ],
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json views must be an array of objects with non-empty name and string filters",
      ),
    )
  })

  test("throws when noteRootDirectory is missing", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json requires a non-empty noteRootDirectory value",
      ),
    )
  })

  test("caches resolved notes directory after first load", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await resolveNotesDirectory()
    await resolveNotesDirectory()

    expect(accessMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledTimes(1)
  })
})
