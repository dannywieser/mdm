import { AppConfigError, resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import type { ScannedNote } from "./notes.types"

import { notesHandler } from "./notes"
import { collectMarkdownFiles } from "./notes.files"
import { applyViewFilter } from "./notes.filters"
import { parseMarkdownFile } from "./notes.parse"
import { scanMarkdownFile } from "./notes.scan"

jest.mock("app-config", () => {
  const actualConfig =
    jest.requireActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: jest.fn(),
  }
})

jest.mock("mdm-util", () => ({
  toLoggableError: jest.fn(),
}))

jest.mock("./notes.files", () => ({
  collectMarkdownFiles: jest.fn(),
}))

jest.mock("./notes.filters", () => ({
  applyViewFilter: jest.fn(),
}))

jest.mock("./notes.parse", () => ({
  parseMarkdownFile: jest.fn(),
}))

jest.mock("./notes.scan", () => ({
  scanMarkdownFile: jest.fn(),
}))

const resolveNotesConfigMock = jest.mocked(resolveNotesConfig)
const toLoggableErrorMock = jest.mocked(toLoggableError)
const collectMarkdownFilesMock = jest.mocked(collectMarkdownFiles)
const applyViewFilterMock = jest.mocked(applyViewFilter)
const parseMarkdownFileMock = jest.mocked(parseMarkdownFile)
const scanMarkdownFileMock = jest.mocked(scanMarkdownFile)

describe("notes handler interface", () => {
  test("returns an error when notes directory config cannot be resolved", async () => {
    resolveNotesConfigMock.mockRejectedValue(
      new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      ),
    )
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error:
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
    })
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(applyViewFilterMock).not.toHaveBeenCalled()
    expect(collectMarkdownFilesMock).not.toHaveBeenCalled()
    expect(scanMarkdownFileMock).not.toHaveBeenCalled()
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()
  })

  test("returns notes and only parses filtered notes after scanning", async () => {
    const scannedNotes = [
      createScannedNote({
        basename: "a.md",
        fullPath: "/notes/a.md",
        id: "a",
        obsidianUrl: "obsidian://open?vault=vault&file=a",
        title: "a",
        titleOrBodyDates: ["2026.05.26"],
      }),
      createScannedNote({
        basename: "b.md",
        fullPath: "/notes/b.md",
        id: "b",
        obsidianUrl: "obsidian://open?vault=vault&file=b",
        title: "b",
      }),
    ]

    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          filters: {
            folder: "notes",
          },
          name: "notes-only",
        },
      ],
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/b.md", "/notes/a.md"])
    scanMarkdownFileMock
      .mockResolvedValueOnce(scannedNotes[0])
      .mockResolvedValueOnce(scannedNotes[1])
    applyViewFilterMock.mockReturnValue([scannedNotes[0]])
    parseMarkdownFileMock.mockResolvedValue({
      ...scannedNotes[0],
      html: "<h1>Note</h1>",
    })
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")
    const body = response.body as {
      notes: unknown[]
      notesDirectory: string
      obsidianVault: string
    }

    expect(response.status).toBe(200)
    expect(body.notes).toEqual([
      expect.objectContaining({
        basename: "a.md",
        html: "<h1>Note</h1>",
        titleOrBodyDates: ["2026.05.26"],
      }),
    ])
    expect(body.notesDirectory).toBe("/notes")
    expect(body.obsidianVault).toBe("vault")
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(scanMarkdownFileMock.mock.calls).toEqual([
      ["/notes/a.md", "/notes", "vault", ["YYYY.MM.DD"]],
      ["/notes/b.md", "/notes", "vault", ["YYYY.MM.DD"]],
    ])
    expect(applyViewFilterMock).toHaveBeenCalledWith(
      scannedNotes,
      [
        {
          filters: {
            folder: "notes",
          },
          name: "notes-only",
        },
      ],
      undefined,
      { dateFormats: ["YYYY.MM.DD"], timezone: "UTC" },
    )
    expect(parseMarkdownFileMock).toHaveBeenCalledTimes(1)
    expect(parseMarkdownFileMock).toHaveBeenCalledWith(
      scannedNotes[0],
      "/notes",
      "attachments",
    )
  })

  test("passes requested view to filter function", async () => {
    const scannedNote = createScannedNote({
      basename: "a.md",
      folder: "downtime",
      frontmatter: {
        type: "book",
      },
      fullPath: "/notes/a.md",
      id: "a",
      obsidianUrl: "obsidian://open?vault=vault&file=a",
      title: "a",
    })

    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          filters: {
            "frontmatter.type": "book",
            folder: "downtime",
          },
          name: "books",
        },
      ],
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md"])
    scanMarkdownFileMock.mockResolvedValue(scannedNote)
    applyViewFilterMock.mockReturnValue([scannedNote])
    parseMarkdownFileMock.mockResolvedValue({
      ...scannedNote,
      html: "<h1>A</h1>",
    })
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes?view=books")

    expect(response.status).toBe(200)
    expect(applyViewFilterMock).toHaveBeenCalledWith(
      [scannedNote],
      [
        {
          filters: {
            "frontmatter.type": "book",
            folder: "downtime",
          },
          name: "books",
        },
      ],
      "books",
      { dateFormats: [], timezone: "UTC" },
    )
  })

  test("returns an error when util loading fails", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
    collectMarkdownFilesMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load notes" })
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(scanMarkdownFileMock).not.toHaveBeenCalled()
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()
    expect(toLoggableErrorMock).toHaveBeenCalledWith(expect.any(Error))
    expect(errorSpy).toHaveBeenCalledTimes(1)

    const [, loggedPayload] = errorSpy.mock.calls[0] as [
      string,
      {
        error: {
          message: string
        }
        notesConfig: {
          attachmentsDirectory: string
          dateFormats: string[]
          notesDirectory: string
          obsidianVault: string
          views: unknown[]
        }
      },
    ]

    expect(loggedPayload.error.message).toBe("boom")
    expect(loggedPayload.notesConfig).toEqual({
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })

    errorSpy.mockRestore()
  })
})

const createScannedNote = (
  overrides: Partial<ScannedNote> = {},
): ScannedNote => ({
  basename: "note.md",
  titleOrBodyDates: [],
  createdDate: "2026-05-26T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: "/notes/note.md",
  id: "note",
  modifiedDate: "2026-05-26T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=note",
  title: "note",
  ...overrides,
})
