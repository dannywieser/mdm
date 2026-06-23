import type { Note } from "markdown"
import { describe, expect, test } from "vitest"

import { buildSearchIndex, filterSearchIndex } from "./NotesGallery.util"

const buildNote = (overrides: Partial<Note> = {}): Note => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  frontmatter: null,
  fullText: "",
  folder: "",
  content: { type: "root" },
  id: "note",
  modifiedDate: "2026-06-01T00:00:00.000Z",
  obsidianUrl: "obsidian://open?vault=v&file=note",
  title: "note",
  ...overrides,
})

const filterNotes = (notes: Note[], query: string): Note[] =>
  filterSearchIndex(buildSearchIndex(notes), query)

describe("filterSearchIndex", () => {
  test("returns all notes when the query is empty", () => {
    const notes = [
      buildNote({ title: "first" }),
      buildNote({ title: "second" }),
    ]

    expect(filterNotes(notes, "")).toEqual(notes)
  })

  test("matches notes by title", () => {
    const notes = [
      buildNote({ title: "Trip to Japan" }),
      buildNote({ title: "Grocery list" }),
    ]

    expect(filterNotes(notes, "japan")).toEqual([notes[0]])
  })

  test("matches notes by frontmatter values", () => {
    const notes = [
      buildNote({ title: "Elden Ring", frontmatter: { type: "game" } }),
      buildNote({ title: "Recipe", frontmatter: { type: "cooking" } }),
    ]

    expect(filterNotes(notes, "game")).toEqual([notes[0]])
  })

  test("matches notes by full text content", () => {
    const notes = [
      buildNote({
        title: "Note A",
        fullText: "discussing a roguelike game design",
      }),
      buildNote({ title: "Note B", fullText: "weekly meal plan" }),
    ]

    expect(filterNotes(notes, "roguelike")).toEqual([notes[0]])
  })

  test("requires every search term to match", () => {
    const notes = [
      buildNote({ title: "Elden Ring", frontmatter: { type: "game" } }),
      buildNote({ title: "Hollow Knight", frontmatter: { type: "game" } }),
    ]

    expect(filterNotes(notes, "elden game")).toEqual([notes[0]])
  })

  test("is case-insensitive", () => {
    const notes = [buildNote({ title: "Trip to Japan" })]

    expect(filterNotes(notes, "JAPAN")).toEqual(notes)
  })
})
