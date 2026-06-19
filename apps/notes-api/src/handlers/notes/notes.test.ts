import { resolveNotesConfig } from "app-config"
import express from "express"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import type { ScannedNote } from "./notes.types"

import { logger } from "../../logger"
import { applyViewFilter } from "./filters/notes.filters"
import { notesHandler } from "./notes"
import { parseMarkdownFile } from "./notes.parse"
import { scanMarkdownFile } from "./notes.scan"

vi.mock("../../logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock("app-config", async () => {
  const actualConfig =
    await vi.importActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: vi.fn(),
  }
})

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    collectMarkdownFiles: vi.fn(),
  }
})

vi.mock("mdm-util", () => ({
  toLoggableError: vi.fn(),
}))

vi.mock("./filters/notes.filters", () => ({
  applyViewFilter: vi.fn(),
}))

vi.mock("./notes.parse", () => ({
  EMPTY_MARKDOWN_NODE: { children: [], type: "root" },
  parseMarkdownFile: vi.fn(),
  resolveFrontmatterImages: vi.fn((fm: unknown) => fm),
}))

vi.mock("./notes.scan", () => ({
  scanMarkdownFile: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const applyViewFilterMock = vi.mocked(applyViewFilter)
const parseMarkdownFileMock = vi.mocked(parseMarkdownFile)
const scanMarkdownFileMock = vi.mocked(scanMarkdownFile)

describe("notes handler interface", () => {

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
      createdDateProperty: "created",
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          component: "NotesList",
          filters: [
            {
              folder: "notes",
            },
          ],
          id: "notes-only",
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
      content: {
        children: [{ type: "text", value: "Note" }],
        type: "root",
      },
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
        content: {
          children: [{ type: "text", value: "Note" }],
          type: "root",
        },
        titleOrBodyDates: ["2026.05.26"],
      }),
    ])
    expect(body.notesDirectory).toBe("/notes")
    expect(body.obsidianVault).toBe("vault")
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(scanMarkdownFileMock.mock.calls).toEqual([
      ["/notes/a.md", "/notes", "vault", ["YYYY.MM.DD"], "created", "attachments"],
      ["/notes/b.md", "/notes", "vault", ["YYYY.MM.DD"], "created", "attachments"],
    ])
    expect(applyViewFilterMock).toHaveBeenCalledWith(
      scannedNotes,
      [
        {
          component: "NotesList",
          filters: [
            {
              folder: "notes",
            },
          ],
          id: "notes-only",
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
      scannedNotes,
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
      createdDateProperty: "created",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          component: "NotesList",
          filters: [
            {
              "frontmatter.type": "book",
              folder: "downtime",
            },
          ],
          id: "books",
          name: "books",
        },
      ],
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md"])
    scanMarkdownFileMock.mockResolvedValue(scannedNote)
    applyViewFilterMock.mockReturnValue([scannedNote])
    parseMarkdownFileMock.mockResolvedValue({
      ...scannedNote,
      content: {
        children: [{ type: "text", value: "A" }],
        type: "root",
      },
    })
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes?view=books")

    expect(response.status).toBe(200)
    expect(applyViewFilterMock).toHaveBeenCalledWith(
      [scannedNote],
      [
        {
          component: "NotesList",
          filters: [
            {
              "frontmatter.type": "book",
              folder: "downtime",
            },
          ],
          id: "books",
          name: "books",
        },
      ],
      "books",
      { dateFormats: [], timezone: "UTC" },
    )
  })

  test("skips markdown body parsing when includeContent=false", async () => {
    const scannedNote = createScannedNote({
      basename: "a.md",
      fullPath: "/notes/a.md",
      id: "a",
      obsidianUrl: "obsidian://open?vault=vault&file=a",
      title: "a",
    })

    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      createdDateProperty: "created",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md"])
    scanMarkdownFileMock.mockResolvedValue(scannedNote)
    applyViewFilterMock.mockReturnValue([scannedNote])

    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes?includeContent=false")
    const body = response.body as { notes: unknown[] }

    expect(response.status).toBe(200)
    expect(body.notes).toEqual([
      expect.objectContaining({
        basename: "a.md",
        content: { children: [], type: "root" },
      }),
    ])
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()
  })

  test("returns an error when util loading fails", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      createdDateProperty: "created",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
    collectMarkdownFilesMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
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
    expect(logger.error).toHaveBeenCalledTimes(1)

    const [loggedContext] = vi.mocked(logger.error).mock.calls[0] as [
      {
        error: { message: string }
        notesConfig: {
          attachmentsDirectory: string
          dateFormats: string[]
          notesDirectory: string
          obsidianVault: string
          views: unknown[]
        }
      },
      string,
    ]

    expect(loggedContext.error.message).toBe("boom")
    expect(loggedContext.notesConfig).toEqual({
      attachmentsDirectory: "attachments",
      createdDateProperty: "created",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
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
  fullText: "",
  id: "note",
  modifiedDate: "2026-05-26T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=note",
  title: "note",
  ...overrides,
})
