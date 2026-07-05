import path from "node:path"

import type { ResolvedNotesConfig } from "../index"

const mockReadFile = vi.fn()
const mockIsNonEmptyString = vi.fn()
const mockIsStringArray = vi.fn()
const mockIsStringRecord = vi.fn()
const mockIsValidTimezone = vi.fn()

vi.mock("node:fs", () => ({
  promises: { readFile: mockReadFile },
}))

vi.mock("mdm-util", () => ({
  isNonEmptyString: mockIsNonEmptyString,
  isStringArray: mockIsStringArray,
  isStringRecord: mockIsStringRecord,
  isValidTimezone: mockIsValidTimezone,
}))

describe("config", () => {
  let resolveNotesConfig: () => Promise<ResolvedNotesConfig>

  beforeEach(async () => {
    vi.resetModules()
    ;({ resolveNotesConfig } = await import("../index.js"))
    process.env.NOTES_ROOT = "/notes-root"

    mockIsNonEmptyString.mockImplementation(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )

    mockIsStringArray.mockImplementation(
      (value): value is string[] =>
        Array.isArray(value) &&
        value.every(
          (entry): entry is string =>
            typeof entry === "string" && entry.trim().length > 0,
        ),
    )

    mockIsStringRecord.mockImplementation(
      (value: unknown): value is Record<string, string> =>
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

    mockIsValidTimezone.mockImplementation((value: unknown) =>
      typeof value === "string" && ["UTC", "America/Toronto"].includes(value),
    )
  })

  test("resolves notes directory from NOTES_ROOT env var", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      notesDirectory: path.resolve("/notes-root"),
    })
  })

  test("resolves notes config with directory and obsidian vault", async () => {
    mockReadFile.mockResolvedValue(
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
            group: "library",
            id: "books",
            name: "books",
          },
        ],
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      attachmentsDirectory: "",
      createdDateProperty: "created",
      dateFormats: ["YYYY.MM.DD", "YY/MM/DD"],
      habits: [],
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
          group: "library",
          id: "books",
          name: "books",
        },
      ],
    })
  })

  test("defaults date formats to an empty array when omitted", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toEqual({
      attachmentsDirectory: "",
      createdDateProperty: "created",
      dateFormats: [],
      habits: [],
      notesDirectory: path.resolve("/notes-root"),
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
  })

  test("defaults createdDateProperty to created when omitted", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      createdDateProperty: "created",
    })
  })

  test("uses configured createdDateProperty when provided", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ createdDateProperty: "date_created", obsidianVault: "vault" }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      createdDateProperty: "date_created",
    })
  })

  test("resolves attachmentsDirectory from app.config.json", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ obsidianVault: "vault", attachmentsDirectory: "attachments" }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      attachmentsDirectory: "attachments",
    })
  })

  test("defaults attachmentsDirectory to empty string when omitted from config", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ obsidianVault: "vault" }))

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      attachmentsDirectory: "",
    })
  })

  test("includes the configured timezone in resolved config", async () => {
    mockReadFile.mockResolvedValue(
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
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      timezone: "UTC",
    })
  })

  test("throws when config file is missing", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" })
    mockReadFile.mockRejectedValue(err)

    await expect(resolveNotesConfig()).rejects.toEqual(
      new Error(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      ),
    )
  })

  test("throws when config json is invalid", async () => {
    mockReadFile.mockResolvedValue("{broken")

    await expect(resolveNotesConfig()).rejects.toEqual(
      new Error("app.config.json must contain valid JSON"),
    )
  })

  test("throws when config file cannot be read", async () => {
    mockReadFile.mockRejectedValue(new Error("EACCES"))

    await expect(resolveNotesConfig()).rejects.toEqual(
      new Error("app.config.json must be readable"),
    )
  })

  test("throws when NOTES_ROOT env var is not set", async () => {
    delete process.env.NOTES_ROOT
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).rejects.toEqual(
      new Error("NOTES_ROOT environment variable is required"),
    )
  })

  test("resolves configured habits", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        habits: [
          {
            id: "exercise",
            name: "Exercise",
            mode: "do-more",
            frontmatterProperty: "exercise",
            trackingWindowDays: 90,
          },
        ],
        obsidianVault: "vault",
      }),
    )

    await expect(resolveNotesConfig()).resolves.toMatchObject({
      habits: [
        {
          id: "exercise",
          name: "Exercise",
          mode: "do-more",
          frontmatterProperty: "exercise",
          trackingWindowDays: 90,
        },
      ],
    })
  })

  test("caches resolved config after first load", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        dateFormats: ["YYYY.MM.DD"],
        obsidianVault: "vault",
      }),
    )

    await resolveNotesConfig()
    await resolveNotesConfig()

    expect(mockReadFile).toHaveBeenCalledTimes(1)
  })
})
