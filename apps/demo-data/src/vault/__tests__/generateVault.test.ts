import { describe, expect, test } from "vitest"

import { generateVault } from "../generateVault"

const END_DATE = "2026-07-01"
const SEED = 1337

describe("generateVault", () => {
  const vault = generateVault(END_DATE, SEED)

  test("generates at least 1000 notes", () => {
    expect(vault.notes.length).toBeGreaterThanOrEqual(1000)
  })

  test("is deterministic for the same seed and end date", () => {
    const again = generateVault(END_DATE, SEED)

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

  test("every cover in frontmatter has a matching attachment", () => {
    const attachmentPaths = new Set(
      vault.attachments.map(({ relativePath }) => relativePath),
    )

    for (const note of vault.notes) {
      const cover = note.frontmatter.cover
      if (typeof cover === "string") {
        expect(attachmentPaths.has(cover)).toBe(true)
      }
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
