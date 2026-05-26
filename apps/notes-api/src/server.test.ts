import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import request from "supertest"

import { createApp } from "./server"

describe("notes-api health endpoint", () => {
  test("returns service health status", async () => {
    const app = createApp()

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: "ok" })
  })
})

describe("notes-api notes endpoint", () => {
  type Note = {
    createdDate: string
    html: string
    modifiedDate: string
  }
  type NotesResponse = {
    notes: Note[]
  }
  type NotesErrorResponse = {
    error: string
  }

  const originalNotesDirectory = process.env.NOTES_DIRECTORY

  afterEach(() => {
    if (originalNotesDirectory === undefined) {
      delete process.env.NOTES_DIRECTORY
    } else {
      process.env.NOTES_DIRECTORY = originalNotesDirectory
    }
  })

  test("returns markdown files parsed to html with metadata", async () => {
    const notesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "notes-api-test-"))
    const nestedFolder = path.join(notesRoot, "nested")
    const rootMarkdownPath = path.join(notesRoot, "welcome.md")
    const nestedMarkdownPath = path.join(nestedFolder, "guide.markdown")

    await fs.mkdir(nestedFolder)
    await Promise.all([
      fs.writeFile(rootMarkdownPath, "# Welcome\n\nRoot note."),
      fs.writeFile(nestedMarkdownPath, "## Guide\n\nNested note."),
      fs.writeFile(path.join(notesRoot, "ignore.txt"), "ignore")
    ])

    process.env.NOTES_DIRECTORY = notesRoot
    const app = createApp()

    const response = await request(app).get("/notes")
    const notesResponse = response.body as NotesResponse

    await fs.rm(notesRoot, { recursive: true, force: true })

    expect(response.status).toBe(200)
    expect(notesResponse.notes).toHaveLength(2)
    expect(notesResponse.notes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          basename: "welcome.md",
          id: "welcome",
          folder: path.basename(notesRoot),
          fullPath: rootMarkdownPath
        }),
        expect.objectContaining({
          basename: "guide.markdown",
          id: "guide",
          folder: "nested",
          fullPath: nestedMarkdownPath
        })
      ])
    )
    expect(
      notesResponse.notes.every((note) => note.html.includes("<"))
    ).toBe(true)
    expect(
      notesResponse.notes.every((note) =>
        Number.isFinite(Date.parse(note.createdDate))
      )
    ).toBe(true)
    expect(
      notesResponse.notes.every((note) =>
        Number.isFinite(Date.parse(note.modifiedDate))
      )
    ).toBe(true)
  })

  test("returns an error when notes directory env var is missing", async () => {
    delete process.env.NOTES_DIRECTORY
    const app = createApp()

    const response = await request(app).get("/notes")
    const errorResponse = response.body as NotesErrorResponse

    expect(response.status).toBe(500)
    expect(errorResponse).toEqual({
      error: "NOTES_DIRECTORY environment variable is required"
    })
  })
})
