import { resolveNotesConfig } from "app-config"
import { createMockNotesConfig } from "app-config/testing"
import express from "express"
import { collectMarkdownFiles, parseFrontMatter } from "markdown"
import { toLoggableError } from "mdm-util"
import { countFilesByExtension } from "mdm-util/node"
import { promises as fs } from "node:fs"
import request from "supertest"

import type { StatsMetaResponse } from "./meta.types"

import { metaHandler } from "./meta"

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
vi.mock("mdm-util/node", () => ({ countFilesByExtension: vi.fn() }))

vi.mock("markdown", async (importOriginal) => {
  const actual = await importOriginal<typeof import("markdown")>()
  return {
    ...actual,
    collectMarkdownFiles: vi.fn(),
    parseFrontMatter: vi.fn(),
  }
})

vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
  },
}))

vi.mock("./meta.cache", () => ({
  createStatsMetaCache: vi.fn(() => ({
    get: (compute: () => Promise<StatsMetaResponse>) => compute(),
  })),
}))

const resolveNotesConfigMock = vi.mocked(resolveNotesConfig)
const toLoggableErrorMock = vi.mocked(toLoggableError)
const collectMarkdownFilesMock = vi.mocked(collectMarkdownFiles)
const parseFrontMatterMock = vi.mocked(parseFrontMatter)
const countFilesByExtensionMock = vi.mocked(countFilesByExtension)
const readFileMock = vi.mocked(fs.readFile)

const mockConfig = createMockNotesConfig({
  attachmentsDirectory: "attachments",
  notesDirectory: "/notes",
})

describe("metaHandler", () => {
  beforeEach(() => {
    resolveNotesConfigMock.mockResolvedValue(mockConfig)
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md", "/notes/projects/b.md"])
    readFileMock.mockResolvedValue("source")
    parseFrontMatterMock.mockImplementation((source) => ({
      body: `${source} body`,
      frontmatter: null,
    }))
    countFilesByExtensionMock.mockResolvedValue({ png: 2 })
  })

  test("returns totals for notes, folders, words, and attachments", async () => {
    const app = express()
    app.get("/meta", metaHandler)

    const response = await request(app).get("/meta")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      totalAttachments: { png: 2 },
      totalFolders: 2,
      totalNotes: 2,
      totalWords: 4,
    })
  })

  test("resolves the attachments directory relative to the notes directory", async () => {
    const app = express()
    app.get("/meta", metaHandler)

    await request(app).get("/meta")

    expect(countFilesByExtensionMock).toHaveBeenCalledWith("/notes/attachments")
  })

  test("skips attachment counting when no attachments directory is configured", async () => {
    resolveNotesConfigMock.mockResolvedValue(
      createMockNotesConfig({ attachmentsDirectory: "", notesDirectory: "/notes" }),
    )
    const app = express()
    app.get("/meta", metaHandler)

    const response = await request(app).get("/meta")

    expect(countFilesByExtensionMock).not.toHaveBeenCalled()
    expect(response.body).toMatchObject({ totalAttachments: {} })
  })

  test("returns a generic 500 for unexpected errors", async () => {
    resolveNotesConfigMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
    const app = express()
    app.get("/meta", metaHandler)

    const response = await request(app).get("/meta")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load stats" })
  })
})
