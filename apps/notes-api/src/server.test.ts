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
  const originalNotesDirectory = process.env.NOTES_DIRECTORY

  afterEach(async () => {
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

    await fs.rm(notesRoot, { recursive: true, force: true })

    expect(response.status).toBe(200)
    expect(response.body.notes).toHaveLength(2)
    expect(response.body.notes).toEqual(
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
      response.body.notes.every((note: { html: string }) =>
        note.html.includes("<")
      )
    ).toBe(true)
    expect(
      response.body.notes.every((note: { createdDate: string }) =>
        Number.isFinite(Date.parse(note.createdDate))
      )
    ).toBe(true)
    expect(
      response.body.notes.every((note: { modifiedDate: string }) =>
        Number.isFinite(Date.parse(note.modifiedDate))
      )
    ).toBe(true)
  })

  test("returns an error when notes directory env var is missing", async () => {
    delete process.env.NOTES_DIRECTORY
    const app = createApp()

    const response = await request(app).get("/notes")

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      error: "NOTES_DIRECTORY environment variable is required"
    })
  })
})
