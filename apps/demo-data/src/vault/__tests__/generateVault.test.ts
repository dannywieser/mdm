import { beforeAll, describe, expect, test, vi } from "vitest"

import type { GeneratedVault } from "../vault.types"

import { generateVault } from "../generateVault"

// Keeps vault generation offline and fast — real photo download is covered
// separately by builderShared's buildCover behavior. Returns bytes derived
// from the URL so tests can tell which source photo an attachment came from.
vi.mock("../images/downloadImage", () => ({
  downloadImage: vi.fn((url: string) => Promise.resolve(Buffer.from(url))),
}))

const END_DATE = "2026-07-01"
const SEED = 1337

describe("generateVault", () => {
  let vault: GeneratedVault

  beforeAll(async () => {
    vault = await generateVault(END_DATE, SEED)
  })

  test("generates at least 700 notes", () => {
    expect(vault.notes.length).toBeGreaterThanOrEqual(700)
  })

  test("is deterministic for the same seed and end date", async () => {
    const again = await generateVault(END_DATE, SEED)

    expect(again.notes).toEqual(vault.notes)
    expect(again.attachments).toEqual(vault.attachments)
  })

  test("includes every folder the demo views filter on", () => {
    const folders = new Set(vault.notes.map((note) => note.folder))

    expect([...folders].toSorted((a, b) => a.localeCompare(b))).toEqual([
      "ideas",
      "journal",
      "library/books",
      "library/movies",
      "people",
      "photos",
      "projects",
      "quotes",
      "recipes",
    ])
  })

  test("writes a journal entry on the end date's month/day in every year so $onThisDay is never empty", () => {
    const journalTitles = new Set(
      vault.notes.filter((note) => note.folder === "journal").map((note) => note.title),
    )

    for (const anniversary of ["2023-07-01", "2024-07-01", "2025-07-01", "2026-07-01"]) {
      expect(journalTitles.has(anniversary)).toBe(true)
    }
  })

  test("always writes a journal entry for the end date so $today matches", () => {
    const todayNote = vault.notes.find(
      (note) => note.folder === "journal" && note.title === END_DATE,
    )

    expect(todayNote).toBeDefined()
    expect(todayNote?.frontmatter.created).toBe(END_DATE)
  })

  test("uses unique note paths and attachment paths", () => {
    const notePaths = vault.notes.map((note) => `${note.folder}/${note.title}.md`)
    const attachmentPaths = vault.attachments.map(({ relativePath }) => relativePath)

    expect(new Set(notePaths).size).toBe(notePaths.length)
    expect(new Set(attachmentPaths).size).toBe(attachmentPaths.length)
  })

  test("every generated cover attachment is embedded as an image in some note's body", () => {
    for (const { relativePath } of vault.attachments) {
      const isReferenced = vault.notes.some((note) => note.body.includes(relativePath))
      expect(isReferenced).toBe(true)
    }
  })

  test("never downloads the same photo for two different cover attachments", () => {
    const jpgAttachments = vault.attachments.filter(({ relativePath }) =>
      relativePath.endsWith(".jpg"),
    )
    const contentsAsHex = jpgAttachments.map(({ contents }) => Buffer.from(contents).toString("hex"))

    expect(jpgAttachments.length).toBeGreaterThan(0)
    expect(new Set(contentsAsHex).size).toBe(contentsAsHex.length)
  })

  test("marks frontmatter.source as pexels only for notes with a real downloaded photo", () => {
    const notesWithJpgCover = vault.notes.filter((note) => note.body.includes(".jpg)"))
    const notesWithSvgCover = vault.notes.filter((note) => note.body.includes(".svg)"))

    expect(notesWithJpgCover.length).toBeGreaterThan(0)
    for (const note of notesWithJpgCover) {
      expect(note.frontmatter.source).toBe("pexels")
    }
    for (const note of notesWithSvgCover) {
      expect(note.frontmatter.source).toBeUndefined()
    }
  })

  test("journal notes carry habit values within the 1-10 range", () => {
    const journalNotes = vault.notes.filter((note) => note.folder === "journal")
    const withExercise = journalNotes.filter(
      (note) => typeof note.frontmatter.exercise === "string",
    )

    expect(withExercise.length).toBeGreaterThan(100)
    for (const note of withExercise) {
      const value = Number(note.frontmatter.exercise)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(10)
    }
  })
})
