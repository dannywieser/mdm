import { AppConfigError, resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import request from "supertest"

import { notesHandler } from "./notes"
import { applyViewFilter } from "./notes.filters"
import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

jest.mock("app-config", () => {
  const actualConfig =
    jest.requireActual<typeof import("app-config")>("app-config")

  return {
    ...actualConfig,
    resolveNotesConfig: jest.fn(),
  }
})

jest.mock("mdm-util", () => ({
  toLoggableError: jest.fn(),
}))

jest.mock("./notes.filters", () => ({
  applyViewFilter: jest.fn(),
}))

jest.mock("./notes.util", () => ({
  collectMarkdownFiles: jest.fn(),
  parseMarkdownFile: jest.fn(),
}))

const resolveNotesConfigMock = jest.mocked(resolveNotesConfig)
const toLoggableErrorMock = jest.mocked(toLoggableError)
const applyViewFilterMock = jest.mocked(applyViewFilter)
const collectMarkdownFilesMock = jest.mocked(collectMarkdownFiles)
const parseMarkdownFileMock = jest.mocked(parseMarkdownFile)

describe("notes handler interface", () => {
  test("returns an error when notes directory config cannot be resolved", async () => {
    resolveNotesConfigMock.mockRejectedValue(
      new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      ),
    )
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error:
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
    })
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(applyViewFilterMock).not.toHaveBeenCalled()
    expect(collectMarkdownFilesMock).not.toHaveBeenCalled()
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()
  })

  test("returns notes and delegates file processing to util functions", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      dateFormats: ["YYYY.MM.DD"],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          filters: {
            folder: "notes",
          },
          name: "notes-only",
        },
      ],
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/b.md", "/notes/a.md"])
    parseMarkdownFileMock.mockImplementation((filePath) =>
      Promise.resolve({
        basename: filePath.split("/").pop() ?? "note.md",
        titleOrBodyDates: filePath.endsWith("a.md") ? ["2026.05.26"] : [],
        createdDate: "2026-05-26T00:00:00.000Z",
        folder: "notes",
        frontmatter: null,
        fullPath: filePath,
        html: "<h1>Note</h1>",
        id: pathToId(filePath),
        modifiedDate: "2026-05-26T00:00:00.000Z",
        obsidianUrl: `obsidian://open?vault=vault&file=${encodeURI(pathToId(filePath))}`,
        title: (filePath.split("/").pop() ?? "note.md").replace(/\.md$/, ""),
      }),
    )
    applyViewFilterMock.mockImplementation((notes) => [...notes])
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
    expect(body.notes).toEqual([
      expect.objectContaining({
        basename: "a.md",
        titleOrBodyDates: ["2026.05.26"],
      }),
      expect.objectContaining({
        basename: "b.md",
        titleOrBodyDates: [],
      }),
    ])
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(parseMarkdownFileMock.mock.calls).toEqual([
      ["/notes/a.md", "/notes", "vault", ["YYYY.MM.DD"], "attachments"],
      ["/notes/b.md", "/notes", "vault", ["YYYY.MM.DD"], "attachments"],
    ])
    expect(applyViewFilterMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({ basename: "a.md" }),
        expect.objectContaining({ basename: "b.md" }),
      ],
      [
        {
          filters: {
            folder: "notes",
          },
          name: "notes-only",
        },
      ],
      undefined,
      { dateFormats: ["YYYY.MM.DD"], timezone: "UTC" },
    )
  })

  test("passes requested view to filter function", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [
        {
          filters: {
            "frontmatter.type": "book",
            folder: "downtime",
          },
          name: "books",
        },
      ],
    })
    collectMarkdownFilesMock.mockResolvedValue(["/notes/a.md"])
    parseMarkdownFileMock.mockResolvedValue({
      basename: "a.md",
      titleOrBodyDates: [],
      createdDate: "2026-05-26T00:00:00.000Z",
      folder: "downtime",
      frontmatter: {
        type: "book",
      },
      fullPath: "/notes/a.md",
      html: "<h1>A</h1>",
      id: "a",
      modifiedDate: "2026-05-26T00:00:00.000Z",
      obsidianUrl: "obsidian://open?vault=vault&file=a",
      title: "a",
    })
    applyViewFilterMock.mockImplementation((notes) => [...notes])
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes?view=books")

    expect(response.status).toBe(200)
    expect(applyViewFilterMock).toHaveBeenCalledWith(
      expect.any(Array),
      [
        {
          filters: {
            "frontmatter.type": "book",
            folder: "downtime",
          },
          name: "books",
        },
      ],
      "books",
      { dateFormats: [], timezone: "UTC" },
    )
  })

  test("returns an error when util loading fails", async () => {
    resolveNotesConfigMock.mockResolvedValue({
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })
    collectMarkdownFilesMock.mockRejectedValue(new Error("boom"))
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    const app = express()
    app.get("/notes", notesHandler)

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Unable to load notes" })
    expect(resolveNotesConfigMock).toHaveBeenCalled()
    expect(collectMarkdownFilesMock).toHaveBeenCalledWith("/notes")
    expect(parseMarkdownFileMock).not.toHaveBeenCalled()
    expect(toLoggableErrorMock).toHaveBeenCalledWith(expect.any(Error))
    expect(errorSpy).toHaveBeenCalledTimes(1)

    const [, loggedPayload] = errorSpy.mock.calls[0] as [
      string,
      {
        error: {
          message: string
        }
        notesConfig: {
          attachmentsDirectory: string
          dateFormats: string[]
          notesDirectory: string
          obsidianVault: string
          views: unknown[]
        }
      },
    ]

    expect(loggedPayload.error.message).toBe("boom")
    expect(loggedPayload.notesConfig).toEqual({
      attachmentsDirectory: "attachments",
      dateFormats: [],
      notesDirectory: "/notes",
      obsidianVault: "vault",
      timezone: "UTC",
      views: [],
    })

    errorSpy.mockRestore()
  })
})

const pathToId = (filePath: string): string =>
  filePath.replace(/\\/g, "/").split("/").pop()?.replace(/\.[^.]+$/, "") ??
  "note"
