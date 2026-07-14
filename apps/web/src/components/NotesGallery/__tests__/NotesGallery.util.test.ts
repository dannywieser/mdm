import type { Note } from "markdown"
import { describe, expect, test } from "vitest"

import {
  buildFrontmatterFacets,
  buildSearchIndex,
  buildYearFacet,
  filterByFrontmatter,
  filterByYear,
  filterSearchIndex,
  getNoteYear,
  MAX_FACET_VALUES,
} from "../NotesGallery.util"

const buildNote = (overrides: Partial<Note> = {}): Note => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  frontmatter: null,
  fullText: "",
  folder: "",
  fullPath: "/notes/note.md",
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
    const notes = [buildNote({ title: "first" }), buildNote({ title: "second" })]

    expect(filterNotes(notes, "")).toEqual(notes)
  })

  test("matches notes by title", () => {
    const notes = [buildNote({ title: "Trip to Japan" }), buildNote({ title: "Grocery list" })]

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
      buildNote({ title: "Note A", fullText: "discussing a roguelike game design" }),
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

describe("getNoteYear", () => {
  test("derives the year from createdDate when present", () => {
    const note = buildNote({ createdDate: "2023-05-01T00:00:00.000Z", modifiedDate: "2026-01-01T00:00:00.000Z" })

    expect(getNoteYear(note)).toBe(2023)
  })

  test("falls back to modifiedDate when createdDate is null", () => {
    const note = buildNote({ createdDate: null, modifiedDate: "2021-11-01T00:00:00.000Z" })

    expect(getNoteYear(note)).toBe(2021)
  })

  test("returns null for an unparseable date", () => {
    const note = buildNote({ createdDate: null, modifiedDate: "not-a-date" })

    expect(getNoteYear(note)).toBeNull()
  })
})

describe("buildYearFacet", () => {
  test("returns distinct years sorted descending", () => {
    const notes = [
      buildNote({ createdDate: "2022-01-01T00:00:00.000Z" }),
      buildNote({ createdDate: "2024-01-01T00:00:00.000Z" }),
      buildNote({ createdDate: "2022-06-01T00:00:00.000Z" }),
    ]

    expect(buildYearFacet(notes)).toEqual([2024, 2022])
  })
})

describe("filterByYear", () => {
  test("returns all notes when no years are selected", () => {
    const notes = [buildNote({ createdDate: "2022-01-01T00:00:00.000Z" })]

    expect(filterByYear(notes, [])).toEqual(notes)
  })

  test("keeps only notes matching a selected year", () => {
    const notes = [
      buildNote({ title: "old", createdDate: "2022-01-01T00:00:00.000Z" }),
      buildNote({ title: "new", createdDate: "2024-01-01T00:00:00.000Z" }),
    ]

    expect(filterByYear(notes, [2024])).toEqual([notes[1]])
  })

  test("ORs multiple selected years together", () => {
    const notes = [
      buildNote({ title: "a", createdDate: "2022-01-01T00:00:00.000Z" }),
      buildNote({ title: "b", createdDate: "2023-01-01T00:00:00.000Z" }),
      buildNote({ title: "c", createdDate: "2024-01-01T00:00:00.000Z" }),
    ]

    expect(filterByYear(notes, [2022, 2024])).toEqual([notes[0], notes[2]])
  })
})

describe("buildFrontmatterFacets", () => {
  test("collects distinct values only for allowed keys", () => {
    const notes = [
      buildNote({ frontmatter: { type: "game", tags: ["rpg", "coop"] } }),
      buildNote({ frontmatter: { type: "cooking", tags: ["coop"] } }),
    ]

    expect(buildFrontmatterFacets(notes, ["tags", "type"])).toEqual([
      { key: "tags", values: ["coop", "rpg"] },
      { key: "type", values: ["cooking", "game"] },
    ])
  })

  test("preserves the order keys are declared in, not alphabetical order", () => {
    const notes = [buildNote({ frontmatter: { tags: ["rpg"], type: "game" } })]

    expect(buildFrontmatterFacets(notes, ["type", "tags"]).map(({ key }) => key)).toEqual([
      "type",
      "tags",
    ])
  })

  test("ignores a frontmatter key that isn't in the allowed list", () => {
    const notes = [buildNote({ frontmatter: { type: "game", tags: ["rpg"] } })]

    expect(buildFrontmatterFacets(notes, ["type"])).toEqual([{ key: "type", values: ["game"] }])
  })

  test("ignores an allowed key that no note actually has", () => {
    const notes = [buildNote({ frontmatter: { type: "game" } })]

    expect(buildFrontmatterFacets(notes, ["type", "missingKey"])).toEqual([
      { key: "type", values: ["game"] },
    ])
  })

  test("returns an empty list when the allowed keys list is empty", () => {
    const notes = [buildNote({ frontmatter: { type: "game" } })]

    expect(buildFrontmatterFacets(notes, [])).toEqual([])
  })

  test("de-duplicates repeated entries in the allowed keys list", () => {
    const notes = [buildNote({ frontmatter: { type: "game" } })]

    expect(buildFrontmatterFacets(notes, ["type", "type"])).toEqual([
      { key: "type", values: ["game"] },
    ])
  })

  test("truncates a key with more distinct values than the cap, keeping the most common ones", () => {
    const notes = [
      // "common" appears 3 times, well above any single "rare-N" value
      ...Array.from({ length: 3 }, () => buildNote({ frontmatter: { free: "common" } })),
      ...Array.from({ length: MAX_FACET_VALUES }, (_, i) => buildNote({ frontmatter: { free: `rare-${i}` } })),
    ]

    const facet = buildFrontmatterFacets(notes, ["free"]).find(({ key }) => key === "free")

    expect(facet?.values).toHaveLength(MAX_FACET_VALUES)
    expect(facet?.values).toContain("common")
  })

  test("ignores blank entries in array frontmatter values", () => {
    const notes = [
      buildNote({ frontmatter: { tags: ["rpg", "", "  "] } }),
      buildNote({ frontmatter: { tags: [""] } }),
    ]

    expect(buildFrontmatterFacets(notes, ["tags"])).toEqual([{ key: "tags", values: ["rpg"] }])
  })

  test("drops a key entirely when all of its values are blank", () => {
    const notes = [buildNote({ frontmatter: { tags: ["", "  "] } })]

    expect(buildFrontmatterFacets(notes, ["tags"])).toEqual([])
  })

  test("returns an empty list when no notes have frontmatter", () => {
    const notes = [buildNote({ frontmatter: null })]

    expect(buildFrontmatterFacets(notes, ["type"])).toEqual([])
  })
})

describe("filterByFrontmatter", () => {
  test("returns all notes when no selections are active", () => {
    const notes = [buildNote({ frontmatter: { type: "game" } })]

    expect(filterByFrontmatter(notes, {})).toEqual(notes)
  })

  test("ORs multiple selected values within the same key", () => {
    const notes = [
      buildNote({ title: "a", frontmatter: { type: "game" } }),
      buildNote({ title: "b", frontmatter: { type: "cooking" } }),
      buildNote({ title: "c", frontmatter: { type: "travel" } }),
    ]

    expect(filterByFrontmatter(notes, { type: ["game", "cooking"] })).toEqual([notes[0], notes[1]])
  })

  test("ANDs selections across different keys", () => {
    const notes = [
      buildNote({ title: "a", frontmatter: { type: "game", status: "done" } }),
      buildNote({ title: "b", frontmatter: { type: "game", status: "active" } }),
    ]

    expect(
      filterByFrontmatter(notes, { type: ["game"], status: ["done"] }),
    ).toEqual([notes[0]])
  })

  test("matches array-valued frontmatter", () => {
    const notes = [
      buildNote({ title: "a", frontmatter: { tags: ["rpg", "coop"] } }),
      buildNote({ title: "b", frontmatter: { tags: ["puzzle"] } }),
    ]

    expect(filterByFrontmatter(notes, { tags: ["coop"] })).toEqual([notes[0]])
  })
})
