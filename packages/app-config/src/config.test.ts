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
    process.env.NOTES_ROOT = "/notes-root"

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

  test("resolves notes directory from NOTES_ROOT env var", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
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
      createdDateProperty: "created",
      dateFormats: ["YYYY.MM.DD", "YY/MM/DD"],
      deriveTitleDate: false,
      habits: [],
      homeStats: {
        show: {
          folderBreakdown: true,
          modifiedToday: true,
          notesCreated: true,
          notesPerDay: true,
          notesWithoutCreatedDate: true,
          totalAttachments: true,
          totalFolders: true,
          totalNotes: true,
          trends: true,
        },
      },
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
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      attachmentsDirectory: "attachments",
      createdDateProperty: "created",
      dateFormats: [],
      deriveTitleDate: false,
      habits: [],
      homeStats: {
        show: {
          folderBreakdown: true,
          modifiedToday: true,
          notesCreated: true,
          notesPerDay: true,
          notesWithoutCreatedDate: true,
          totalAttachments: true,
          totalFolders: true,
          totalNotes: true,
          trends: true,
        },
      },
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
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      attachmentsDirectory: "attachments",
      createdDateProperty: "created",
      dateFormats: ["YYYY.MM.DD"],
      deriveTitleDate: false,
      habits: [],
      homeStats: {
        show: {
          folderBreakdown: true,
          modifiedToday: true,
          notesCreated: true,
          notesPerDay: true,
          notesWithoutCreatedDate: true,
          totalAttachments: true,
          totalFolders: true,
          totalNotes: true,
          trends: true,
        },
      },
      notesDirectory: path.resolve("/notes-root"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
  })

  test("defaults homeStats show fields to true when homeStats is omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      homeStats: {
        show: {
          folderBreakdown: true,
          modifiedToday: true,
          notesCreated: true,
          notesPerDay: true,
          totalAttachments: true,
          totalFolders: true,
          totalNotes: true,
          trends: true,
        },
      },
    })
  })

  test("merges configured homeStats show overrides with defaults", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        homeStats: { show: { folderBreakdown: false, totalAttachments: false } },
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      homeStats: {
        show: {
          folderBreakdown: false,
          modifiedToday: true,
          notesCreated: true,
          notesPerDay: true,
          totalAttachments: false,
          totalFolders: true,
          totalNotes: true,
          trends: true,
        },
      },
    })
  })

  test("throws when homeStats.show is null", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        homeStats: { show: null },
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new AppConfigError(
        "app.config.json homeStats.show must be an object with boolean values for each display section",
      ),
    )
  })

  test("throws when homeStats.show contains a non-boolean value", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        homeStats: { show: { totalNotes: "yes" } },
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new AppConfigError(
        "app.config.json homeStats.show must be an object with boolean values for each display section",
      ),
    )
  })

  test("defaults createdDateProperty to created when omitted", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      createdDateProperty: "created",
    })
  })

  test("uses configured createdDateProperty when provided", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({ createdDateProperty: "date_created", obsidianVault: "vault" }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      createdDateProperty: "date_created",
    })
  })

  test("throws when createdDateProperty is not a non-empty string", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({ createdDateProperty: "", obsidianVault: "vault" }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new AppConfigError("app.config.json createdDateProperty must be a non-empty string"),
    )
  })

  test("defaults deriveTitleDate to false when omitted", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      deriveTitleDate: false,
    })
  })

  test("uses configured deriveTitleDate when provided", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({ deriveTitleDate: true, obsidianVault: "vault" }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      deriveTitleDate: true,
    })
  })

  test("throws when deriveTitleDate is not a boolean", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({ deriveTitleDate: "yes", obsidianVault: "vault" }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new AppConfigError("app.config.json deriveTitleDate must be a boolean"),
    )
  })

  test("uses configured attachmentsDirectory when provided", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        attachmentsDirectory: "assets",
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
    readFileMock.mockResolvedValue(JSON.stringify({}))

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

  test("throws when NOTES_ROOT env var is not set", async () => {
    delete process.env.NOTES_ROOT
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError("NOTES_ROOT environment variable is required"),
    )
  })

  test("resolves configured habits", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        habits: [
          {
            id: "exercise",
            name: "Exercise",
            mode: "do-more",
            frontmatterProperty: "exercise",
            trackingWindowDays: 90,
          },
          {
            id: "stress",
            name: "Stress",
            mode: "do-less",
            frontmatterProperty: "stress",
            trackingWindowDays: 30,
          },
        ],
        obsidianVault: "vault",
      }),
    )

    const config = await resolveNotesConfig()

    expect(config.habits).toEqual([
      {
        id: "exercise",
        name: "Exercise",
        mode: "do-more",
        frontmatterProperty: "exercise",
        trackingWindowDays: 90,
      },
      {
        id: "stress",
        name: "Stress",
        mode: "do-less",
        frontmatterProperty: "stress",
        trackingWindowDays: 30,
      },
    ])
  })

  test("defaults habits to an empty array when omitted", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    const config = await resolveNotesConfig()

    expect(config.habits).toEqual([])
  })

  test("throws when habits is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        habits: [
          {
            id: "exercise",
            name: "Exercise",
            mode: "sometimes",
            frontmatterProperty: "exercise",
            trackingWindowDays: 90,
          },
        ],
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), and a positive integer trackingWindowDays",
      ),
    )
  })

  test("throws when habit trackingWindowDays is not a positive number", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        habits: [
          {
            id: "exercise",
            name: "Exercise",
            mode: "do-more",
            frontmatterProperty: "exercise",
            trackingWindowDays: 0,
          },
        ],
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), and a positive integer trackingWindowDays",
      ),
    )
  })

  test("throws when habit trackingWindowDays is not an integer", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        habits: [
          {
            id: "exercise",
            name: "Exercise",
            mode: "do-more",
            frontmatterProperty: "exercise",
            trackingWindowDays: 30.5,
          },
        ],
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesDirectory()).rejects.toEqual(
      new AppConfigError(
        "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), and a positive integer trackingWindowDays",
      ),
    )
  })

  test("caches resolved notes directory after first load", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        obsidianVault: "vault",
      }),
    )

    await resolveNotesDirectory()
    await resolveNotesDirectory()

    expect(accessMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledTimes(1)
  })
})
