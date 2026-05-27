import express from "express"
import request from "supertest"

import { AppConfigError, resolveNotesConfig } from "../../config"
import { notesHandler } from "./notes"
import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

jest.mock("../../config", () => {
  const actualConfig =
    jest.requireActual<typeof import("../../config")>("../../config")

  return {
    ...actualConfig,
    resolveNotesConfig: jest.fn()
  }
})

jest.mock("./notes.util", () => ({
  collectMarkdownFiles: jest.fn(),
  parseMarkdownFile: jest.fn()
}))

const resolveNotesConfigMock = jest.mocked(resolveNotesConfig)
const collectMarkdownFilesMock = jest.mocked(collectMarkdownFiles)
const parseMarkdownFileMock = jest.mocked(parseMarkdownFile)

describe("notes handler interface", () => {
  test("returns an error when notes directory config cannot be resolved", async () => {
    resolveNotesConfigMock.mockRejectedValue(
      new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json."
      )
    )
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error:
        "app.config.json is required. Copy app.config.example.json to app.config.json."
    })
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).not.toHaveBeenCalled()
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()
  })

  test("returns notes and delegates file processing to util functions", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      notesDirectory: "/notes",
      obsidianVault: "vault"
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/b.md", "/notes/a.md"])
    parseMarkdownFileMock.mockImplementation((filePath) =>
      Promise.resolve({
        basename: filePath.split("/").pop() ?? "note.md",
        createdDate: "2026-05-26T00:00:00.000Z",
        folder: "notes",
        frontmatter: null,
        fullPath: filePath,
        html: "<h1>Note</h1>",
        id: pathToId(filePath),
        modifiedDate: "2026-05-26T00:00:00.000Z"
      })
    )
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")
    const body = response.body as {
      notes: unknown[]
      notesDirectory: string
      obsidianVault: string
    }

    expect(response.status).toBe(200)
    expect(body.notes).toHaveLength(2)
    expect(body.notesDirectory).toBe("/notes")
    expect(body.obsidianVault).toBe("vault")
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(parseMarkdownFileMock.mock.calls.map(([filePath]) => filePath)).toEqual([
      "/notes/a.md",
      "/notes/b.md"
    ])
  })

  test("returns an error when util loading fails", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      notesDirectory: "/notes",
      obsidianVault: "vault"
    })
    collectMarkdownFilesMock.mockRejectedValue(new Error("boom"))
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load notes" })
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})

const pathToId = (filePath: string): string =>
  filePath.replace(/\\/g, "/").split("/").pop()?.replace(/\.[^.]+$/, "") ?? "note"
