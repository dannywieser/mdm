import { AppConfigError, resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { collectMarkdownFiles } from "../notes/notes.files"
import { scanMarkdownFile } from "../notes/notes.scan"
import { statsHandler } from "./stats"
import { countFilesRecursive } from "./stats.files"
import {
  buildFolderBreakdown,
  buildNotesCreated,
  buildNotesPerDay,
  buildTrends,
  buildViewCounts,
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

vi.mock("../notes/notes.files", () => ({
  collectMarkdownFiles: vi.fn(),
}))

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
  buildViewCounts: vi.fn(),
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
const buildViewCountsMock = vi.mocked(buildViewCounts)
const countFoldersMock = vi.mocked(countFolders)
const countModifiedTodayMock = vi.mocked(countModifiedToday)
const countNotesWithoutCreatedDateMock = vi.mocked(countNotesWithoutCreatedDate)

const mockHomeStats = {
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
}

const mockConfig = {
  attachmentsDirectory: "attachments",
  createdDateProperty: "created",
  dateFormats: ["YYYY.MM.DD"],
  deriveTitleDate: false,
  homeStats: mockHomeStats,
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
    buildViewCountsMock.mockReturnValue([
      {
        badges: ["folder", "frontmatter.type"],
        component: "NotesList",
        count: 5,
        id: "books",
        name: "Books",
      },
    ])
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
      homeStats: mockHomeStats,
      modifiedToday: 1,
      notesCreated: { last30Days: 3, last365Days: 40, last90Days: 15 },
      notesPerDay: [{ count: 1, date: "2026-06-01" }],
      notesWithoutCreatedDate: 5,
      timezone: "UTC",
      totalAttachments: 12,
      totalFolders: 3,
      totalNotes: 2,
      trends: { changePercent: 50, notesLast30Days: 3, notesPrevious30Days: 2 },
      views: [
        {
          badges: ["folder", "frontmatter.type"],
          component: "NotesList",
          count: 5,
          id: "books",
          name: "Books",
        },
      ],
    })
  })

  test("passes the correct context to util functions", async () => {
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
    expect(countFilesRecursiveMock).toHaveBeenCalledWith("/notes/attachments")
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
