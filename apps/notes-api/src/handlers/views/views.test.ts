import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import express from "express"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { scanFile } from "../../../../../packages/markdown/src/files/scanFile"
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

vi.mock("../notes/scanFile", () => ({
  scanFile: vi.fn(),
}))

vi.mock("./views.util", () => ({
  buildViews: vi.fn(),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const scanMarkdownFileMock = vi.mocked(scanFile)
const buildViewsMock = vi.mocked(buildViews)

const mockConfig = createMockNotesConfig({
  attachmentsDirectory: "images",
  dateFormats: ["YYYY.MM.DD"],
  views: [
    {
      badges: ["folder", "frontmatter.type"],
      component: "NotesList",
      filters: [{ "frontmatter.type": "book" }],
      id: "books",
      name: "Books",
    },
  ],
})

const mockNote = {
  basename: "a.md",
  createdDate: "2026-06-01T00:00:00.000Z",
  dates: [],
  folder: "notes",
  frontmatter: null,
  fullText: "",
  id: "a",
  modifiedDate: "2026-06-01T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=vault&file=a",
  title: "a",
}

describe("views handler interface", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(mockConfig)
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md"])
    scanMarkdownFileMock.mockResolvedValue(mockNote)
    buildViewsMock.mockResolvedValue([
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

  test("passes scanned notes to buildViews", async () => {
    const app = express()
    app.get("/views", viewsHandler)

    await request(app).get("/views")

    expect(buildViewsMock).toHaveBeenCalledWith(expect.any(Array))
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
