import { AppConfigError, resolveNotesConfig } from "app-config"
import express from "express"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { scanMarkdownFile } from "../notes/notes.scan"
import { viewsHandler } from "./views"
import { buildViews } from "./views.util"

vi.mock("app-config", async () => {
  const actualConfig =
    await vi.importActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: vi.fn(),
  }
})

vi.mock("mdm-util", () => ({ toLoggableError: vi.fn() }))

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    collectMarkdownFiles: vi.fn(),
  }
})

vi.mock("../notes/notes.scan", () => ({
  scanMarkdownFile: vi.fn(),
}))

vi.mock("./views.util", () => ({
  buildViews: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const scanMarkdownFileMock = vi.mocked(scanMarkdownFile)
const buildViewsMock = vi.mocked(buildViews)

const mockConfig = {
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
  notesDirectory: "/notes",
  obsidianVault: "vault",
  timezone: "UTC",
  views: [
    {
      badges: ["folder", "frontmatter.type"],
      component: "NotesList",
      filters: [{ "frontmatter.type": "book" }],
      id: "books",
      name: "Books",
    },
  ],
}

const mockNote = {
  basename: "a.md",
  createdDate: "2026-06-01T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: "/notes/a.md",
  fullText: "",
  id: "a",
  modifiedDate: "2026-06-01T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=a",
  title: "a",
  titleOrBodyDates: [],
}

describe("views handler interface", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(mockConfig)
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md"])
    scanMarkdownFileMock.mockResolvedValue(mockNote)
    buildViewsMock.mockReturnValue([
      {
        badges: ["folder", "frontmatter.type"],
        component: "NotesList",
        count: 1,
        id: "books",
        name: "Books",
        noteIds: ["a"],
      },
    ])
  })

  test("returns the configured views with note ids", async () => {
    const app = express()
    app.get("/views", viewsHandler)

    const response = await request(app).get("/views")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      views: [
        {
          badges: ["folder", "frontmatter.type"],
          component: "NotesList",
          count: 1,
          id: "books",
          name: "Books",
          noteIds: ["a"],
        },
      ],
    })
  })

  test("passes the correct context to buildViews", async () => {
    const app = express()
    app.get("/views", viewsHandler)

    await request(app).get("/views")

    expect(buildViewsMock).toHaveBeenCalledWith(expect.any(Array), mockConfig.views, {
      dateFormats: mockConfig.dateFormats,
      timezone: mockConfig.timezone,
    })
  })

  test("returns a 500 with the config error message when config resolution fails", async () => {
    resolveNotesConfigMock.mockRejectedValue(
      new AppConfigError("app.config.json is required."),
    )
    const app = express()
    app.get("/views", viewsHandler)

    const response = await request(app).get("/views")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "app.config.json is required." })
  })

  test("returns a generic 500 for unexpected errors", async () => {
    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
    const app = express()
    app.get("/views", viewsHandler)

    const response = await request(app).get("/views")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load views" })
  })
})
