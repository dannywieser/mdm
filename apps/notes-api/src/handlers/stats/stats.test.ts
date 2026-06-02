import { AppConfigError, resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { collectMarkdownFiles } from "../notes/notes.files"
import { scanMarkdownFile } from "../notes/notes.scan"
import { statsHandler } from "./stats"
import { buildViewCounts, countModifiedToday } from "./stats.util"

vi.mock("app-config", async () => {
  const actualConfig =
    await vi.importActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: vi.fn(),
  }
})

vi.mock("mdm-util", () => ({ toLoggableError: vi.fn() }))

vi.mock("../notes/notes.files", () => ({
  collectMarkdownFiles: vi.fn(),
}))

vi.mock("../notes/notes.scan", () => ({
  scanMarkdownFile: vi.fn(),
}))

vi.mock("./stats.util", () => ({
  buildViewCounts: vi.fn(),
  countModifiedToday: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const scanMarkdownFileMock = vi.mocked(scanMarkdownFile)
const buildViewCountsMock = vi.mocked(buildViewCounts)
const countModifiedTodayMock = vi.mocked(countModifiedToday)

const mockConfig = {
  attachmentsDirectory: "attachments",
  dateFormats: ["YYYY.MM.DD"],
  notesDirectory: "/notes",
  obsidianVault: "vault",
  timezone: "UTC",
  views: [
    {
      component: "NotesList",
      filters: [{ "frontmatter.type": "book" }],
      id: "books",
      name: "Books",
    },
  ],
}

describe("stats handler interface", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(mockConfig)
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md", "/notes/b.md"])
    scanMarkdownFileMock.mockResolvedValue({
      basename: "a.md",
      createdDate: "2026-06-01T00:00:00.000Z",
      folder: "notes",
      frontmatter: null,
      fullPath: "/notes/a.md",
      id: "a",
      modifiedDate: "2026-06-01T00:00:00.000Z",
      obsidianUrl: "obsidian://open?vault=vault&file=a",
      title: "a",
      titleOrBodyDates: [],
    })
    countModifiedTodayMock.mockReturnValue(1)
    buildViewCountsMock.mockReturnValue([
      { component: "NotesList", count: 5, id: "books", name: "Books" },
    ])
  })

  test("returns stats with totalNotes, modifiedToday, and per-view counts", async () => {
    const app = express()
    app.get("/stats", statsHandler)

    const response = await request(app).get("/stats")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      modifiedToday: 1,
      totalNotes: 2,
      views: [{ component: "NotesList", count: 5, id: "books", name: "Books" }],
    })
  })

  test("passes the correct context to buildViewCounts", async () => {
    const app = express()
    app.get("/stats", statsHandler)

    await request(app).get("/stats")

    expect(buildViewCountsMock).toHaveBeenCalledWith(
      expect.any(Array),
      mockConfig.views,
      { dateFormats: mockConfig.dateFormats, timezone: mockConfig.timezone },
    )
    expect(countModifiedTodayMock).toHaveBeenCalledWith(
      expect.any(Array),
      mockConfig.timezone,
    )
  })

  test("returns a 500 with the config error message when config resolution fails", async () => {
    resolveNotesConfigMock.mockRejectedValue(
      new AppConfigError("app.config.json is required."),
    )
    const app = express()
    app.get("/stats", statsHandler)

    const response = await request(app).get("/stats")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "app.config.json is required." })
  })

  test("returns a generic 500 for unexpected errors", async () => {
    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
    const app = express()
    app.get("/stats", statsHandler)

    const response = await request(app).get("/stats")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load stats" })
  })
})
