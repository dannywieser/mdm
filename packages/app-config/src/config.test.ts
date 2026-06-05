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

vi.mock("node:fs", () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
  },
}))

vi.mock("mdm-util", () => ({
  isNonEmptyString: vi.fn(),
  isStringArray: vi.fn(),
  isStringRecord: vi.fn(),
  isValidTimezone: vi.fn(),
}))

const accessMock = vi.mocked(fs.access)
const isNonEmptyStringMock = vi.mocked(isNonEmptyString)
const isStringArrayMock = vi.mocked(isStringArray)
const isStringRecordMock = vi.mocked(isStringRecord)
const isValidTimezoneMock = vi.mocked(isValidTimezone)
const readFileMock = vi.mocked(fs.readFile)

describe("config", () => {
  beforeEach(() => {
    accessMock.mockResolvedValue(undefined)
    clearConfigCache()
    delete process.env.NOTES_ROOT

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

  test("resolves notes directory from noteRootDirectory", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).resolves.toBe(
      path.resolve("/notes-root"),
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
            badges: ["folder", "frontmatter.type"],
            component: "NotesList",
            filters: [
              {
                folder: "downtime",
                "frontmatter.type": "book",
              },
              {
                $exclude: {
                  folder: "archive",
                },
              },
            ],
            id: "books",
            name: "books",
          },
        ],
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      attachmentsDirectory: "attachments",
      dateFormats: ["YYYY.MM.DD", "YY/MM/DD"],
      notesDirectory: path.resolve("/notes-root"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          badges: ["folder", "frontmatter.type"],
          component: "NotesList",
          filters: [
            {
              folder: "downtime",
              "frontmatter.type": "book",
            },
            {
              $exclude: {
                folder: "archive",
              },
            },
          ],
          id: "books",
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
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: path.resolve("/notes-root"),
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
      attachmentsDirectory: "attachments",
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: path.resolve("/notes-root"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
  })

  test("uses configured attachmentsDirectory when provided", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        attachmentsDirectory: "assets",
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      attachmentsDirectory: "assets",
    })
  })

  test("defaults attachmentsDirectory to attachments when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      attachmentsDirectory: "attachments",
    })
  })

  test("throws when attachmentsDirectory is not a non-empty string", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        attachmentsDirectory: "",
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new AppConfigError(
        "app.config.json attachmentsDirectory must be a non-empty string",
      ),
    )
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
        "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges, and filters as string records or $exclude objects",
      ),
    )
  })

  test("throws when view badges is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
        views: [
          {
            badges: ["folder", ""],
            component: "NotesList",
            filters: [{ folder: "downtime" }],
            id: "books",
            name: "Books",
          },
        ],
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges, and filters as string records or $exclude objects",
      ),
    )
  })

  test("throws when exclude filter shape is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/notes-root",
        obsidianVault: "vault",
        views: [
          {
            component: "NotesList",
            filters: [{ $exclude: "archive" }],
            id: "books",
            name: "Books",
          },
        ],
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges, and filters as string records or $exclude objects",
      ),
    )
  })

  test("throws when neither NOTES_ROOT env var nor noteRootDirectory config key is set", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "noteRootDirectory must be set via the NOTES_ROOT environment variable or app.config.json",
      ),
    )
  })

  test("resolves notes directory from NOTES_ROOT env var when noteRootDirectory is absent from config", async () => {
    process.env.NOTES_ROOT = "/env/notes-root"
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).resolves.toBe(
      path.resolve("/env/notes-root"),
    )
  })

  test("NOTES_ROOT env var takes precedence over noteRootDirectory in config", async () => {
    process.env.NOTES_ROOT = "/env/notes-root"
    readFileMock.mockResolvedValue(
      JSON.stringify({
        noteRootDirectory: "/config/notes-root",
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).resolves.toBe(
      path.resolve("/env/notes-root"),
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
