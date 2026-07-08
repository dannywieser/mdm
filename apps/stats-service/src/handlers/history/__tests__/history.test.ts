import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import express from "express"
import { collectMarkdownFiles, extractNoteDates } from "markdown"
import { toLoggableError } from "mdm-util"
import { promises as fs } from "node:fs"
import request from "supertest"

import { historyHandler } from "../history"

vi.mock("app-config", async () => {
  const actualConfig =
    await vi.importActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: vi.fn(),
  }
})

vi.mock("mdm-util", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mdm-util")>()
  return { ...actual, toLoggableError: vi.fn() }
})

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    collectMarkdownFiles: vi.fn(),
    extractNoteDates: vi.fn(),
  }
})

vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
    stat: vi.fn(),
  },
}))

vi.mock("../history.cache", () => ({
  createStatsHistoryCache: vi.fn(() => ({
    get: (compute: () => Promise<unknown>) => compute(),
  })),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const extractNoteDatesMock = vi.mocked(extractNoteDates)
const readFileMock = vi.mocked(fs.readFile)
const statMock = vi.mocked(fs.stat)

const mockConfig = createMockNotesConfig({ notesDirectory: "/notes" })

describe("historyHandler", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(mockConfig)
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md", "/notes/projects/b.md"])
    readFileMock.mockResolvedValue("source")
    statMock.mockImplementation((filePath) =>
      Promise.resolve({
        mtime: filePath === "/notes/a.md"
          ? new Date("2026-05-01T00:00:00.000Z")
          : new Date("2026-05-02T00:00:00.000Z"),
      } as never),
    )
    extractNoteDatesMock.mockImplementation((title) =>
      title === "a" ? ["2026-04-01T00:00:00.000Z"] : [],
    )
  })

  test("returns per-date history entries sorted ascending", async () => {
    const app = express()
    app.get("/history", historyHandler)

    const response = await request(app).get("/history")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      { date: "2026-04-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-01", entriesCreated: 0, entriesModified: 1, foldersTouched: 1 },
      { date: "2026-05-02", entriesCreated: 1, entriesModified: 1, foldersTouched: 1 },
    ])
  })

  test("resolves each note's folder relative to the notes directory", async () => {
    const app = express()
    app.get("/history", historyHandler)

    const response = await request(app).get("/history")
    const body = response.body as { date: string; foldersTouched: number }[]

    const entryForBCreatedDate = body.find((entry) => entry.date === "2026-05-02")
    expect(entryForBCreatedDate).toMatchObject({ foldersTouched: 1 })
  })

  test("returns a generic 500 for unexpected errors", async () => {
    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
    const app = express()
    app.get("/history", historyHandler)

    const response = await request(app).get("/history")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load stats history" })
  })
})
