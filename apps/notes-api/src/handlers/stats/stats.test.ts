import { AppConfigError, resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { collectMarkdownFiles } from "../notes/notes.files"
import { scanMarkdownFile } from "../notes/notes.scan"
import { statsHandler } from "./stats"
import { buildViewCounts, countModifiedToday } from "./stats.util"

jest.mock("app-config", () => {
  const actualConfig =
    jest.requireActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: jest.fn(),
  }
})

jest.mock("mdm-util", () => ({ toLoggableError: jest.fn() }))

jest.mock("../notes/notes.files", () => ({
  collectMarkdownFiles: jest.fn(),
}))

jest.mock("../notes/notes.scan", () => ({
  scanMarkdownFile: jest.fn(),
}))

jest.mock("./stats.util", () => ({
  buildViewCounts: jest.fn(),
  countModifiedToday: jest.fn(),
}))

const resolveNotesConfigMock = jest.mocked(resolveNotesConfig)
const toLoggableErrorMock = jest.mocked(toLoggableError)
const collectMarkdownFilesMock = jest.mocked(collectMarkdownFiles)
const scanMarkdownFileMock = jest.mocked(scanMarkdownFile)
const buildViewCountsMock = jest.mocked(buildViewCounts)
const countModifiedTodayMock = jest.mocked(countModifiedToday)

const mockConfig = {
  attachmentsDirectory: "attachments",
  dateFormats: ["YYYY.MM.DD"],
  notesDirectory: "/notes",
  obsidianVault: "vault",
  timezone: "UTC",
  views: [{ filters: [{ "frontmatter.type": "book" }], name: "books" }],
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
    buildViewCountsMock.mockReturnValue([{ count: 5, name: "books" }])
  })

  test("returns stats with totalNotes, modifiedToday, and per-view counts", async () => {
    const app = express()
    app.get("/stats", statsHandler)

    const response = await request(app).get("/stats")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      modifiedToday: 1,
      totalNotes: 2,
      views: [{ count: 5, name: "books" }],
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
