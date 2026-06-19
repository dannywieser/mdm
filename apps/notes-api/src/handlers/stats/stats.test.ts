import { resolveNotesConfig } from "app-config"
import express from "express"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { scanMarkdownFile } from "../notes/notes.scan"
import { statsHandler } from "./stats"
import { countFilesRecursive } from "./stats.files"
import {
  buildFolderBreakdown,
  buildNotesCreated,
  buildNotesPerDay,
  buildTrends,
  countFolders,
  countModifiedToday,
  countNotesWithoutCreatedDate,
} from "./stats.util"

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

vi.mock("./stats.files", () => ({
  countFilesRecursive: vi.fn(),
}))

vi.mock("./stats.util", () => ({
  buildFolderBreakdown: vi.fn(),
  buildNotesCreated: vi.fn(),
  buildNotesPerDay: vi.fn(),
  buildTrends: vi.fn(),
  countFolders: vi.fn(),
  countModifiedToday: vi.fn(),
  countNotesWithoutCreatedDate: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const scanMarkdownFileMock = vi.mocked(scanMarkdownFile)
const countFilesRecursiveMock = vi.mocked(countFilesRecursive)
const buildFolderBreakdownMock = vi.mocked(buildFolderBreakdown)
const buildNotesCreatedMock = vi.mocked(buildNotesCreated)
const buildNotesPerDayMock = vi.mocked(buildNotesPerDay)
const buildTrendsMock = vi.mocked(buildTrends)
const countFoldersMock = vi.mocked(countFolders)
const countModifiedTodayMock = vi.mocked(countModifiedToday)
const countNotesWithoutCreatedDateMock = vi.mocked(countNotesWithoutCreatedDate)

const mockConfig = {
  attachmentsDirectory: "/images",
  createdDateProperty: "created",
  dateFormats: ["YYYY.MM.DD"],
  deriveTitleDate: false,
  notesDirectory: "/notes",
  obsidianVault: "vault",
  timezone: "UTC",
  views: [],
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

describe("stats handler interface", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(mockConfig)
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md", "/notes/b.md"])
    scanMarkdownFileMock.mockResolvedValue(mockNote)
    countFilesRecursiveMock.mockResolvedValue(12)
    countModifiedTodayMock.mockReturnValue(1)
    countFoldersMock.mockReturnValue(3)
    buildFolderBreakdownMock.mockReturnValue([
      { count: 5, folder: "notes" },
    ])
    buildNotesCreatedMock.mockReturnValue({
      last30Days: 3,
      last365Days: 40,
      last90Days: 15,
    })
    buildTrendsMock.mockReturnValue({
      changePercent: 50,
      notesLast30Days: 3,
      notesPrevious30Days: 2,
    })
    buildNotesPerDayMock.mockReturnValue([{ count: 1, date: "2026-06-01" }])
    countNotesWithoutCreatedDateMock.mockReturnValue(5)
  })

  test("returns expanded stats response", async () => {
    const app = express()
    app.get("/stats", statsHandler)

    const response = await request(app).get("/stats")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      folderBreakdown: [{ count: 5, folder: "notes" }],
      modifiedToday: 1,
      notesCreated: { last30Days: 3, last365Days: 40, last90Days: 15 },
      notesPerDay: [{ count: 1, date: "2026-06-01" }],
      notesWithoutCreatedDate: 5,
      totalAttachments: 12,
      totalFolders: 3,
      totalNotes: 2,
      trends: { changePercent: 50, notesLast30Days: 3, notesPrevious30Days: 2 },
    })
  })

  test("passes the correct context to util functions", async () => {
    const app = express()
    app.get("/stats", statsHandler)

    await request(app).get("/stats")

    expect(countModifiedTodayMock).toHaveBeenCalledWith(
      expect.any(Array),
      mockConfig.timezone,
    )
    expect(countFilesRecursiveMock).toHaveBeenCalledWith("/images")
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
