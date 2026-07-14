import type { Note } from "markdown"

import type { FrontmatterFacet } from "./NotesGallery.types"

export interface SearchableNote {
  haystack: string
  note: Note
}

/** Facets with more distinct values than this are truncated to their most common values. */
export const MAX_FACET_VALUES = 20

export function buildSearchIndex(notes: Note[]): SearchableNote[] {
  return notes.map((note) => ({ haystack: buildSearchableText(note), note }))
}

export function filterSearchIndex(index: SearchableNote[], query: string): Note[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)

  if (terms.length === 0) return index.map(({ note }) => note)

  return index
    .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
    .map(({ note }) => note)
}

function buildSearchableText(note: Note): string {
  return [note.title, JSON.stringify(note.frontmatter ?? {}), note.fullText]
    .join(" ")
    .toLowerCase()
}

export function getNoteYear(note: Note): number | null {
  const date = new Date(note.createdDate ?? note.modifiedDate)
  if (Number.isNaN(date.getTime())) return null

  return date.getUTCFullYear()
}

function getFrontmatterValues(note: Note, key: string): string[] {
  const value = note.frontmatter?.[key]
  if (value === undefined) return []

  return Array.isArray(value) ? value : [value]
}

export function buildFrontmatterFacets(notes: Note[]): FrontmatterFacet[] {
  const countsByKey = new Map<string, Map<string, number>>()

  for (const note of notes) {
    for (const [key, value] of Object.entries(note.frontmatter ?? {})) {
      const counts = countsByKey.get(key) ?? new Map<string, number>()
      for (const entry of Array.isArray(value) ? value : [value]) {
        if (!entry.trim()) continue
        counts.set(entry, (counts.get(entry) ?? 0) + 1)
      }
      countsByKey.set(key, counts)
    }
  }

  return [...countsByKey.entries()]
    .filter(([, counts]) => counts.size > 0)
    .map(([key, counts]) => ({
      key,
      values: [...counts.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, MAX_FACET_VALUES)
        .map(([value]) => value)
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function buildYearFacet(notes: Note[]): number[] {
  const years = new Set<number>()

  for (const note of notes) {
    const year = getNoteYear(note)
    if (year !== null) years.add(year)
  }

  return [...years].sort((a, b) => b - a)
}

export function filterByYear(notes: Note[], selectedYears: number[]): Note[] {
  if (selectedYears.length === 0) return notes

  return notes.filter((note) => {
    const year = getNoteYear(note)
    return year !== null && selectedYears.includes(year)
  })
}

export function filterByFrontmatter(
  notes: Note[],
  selections: Record<string, string[]>,
): Note[] {
  const activeEntries = Object.entries(selections).filter(([, values]) => values.length > 0)

  if (activeEntries.length === 0) return notes

  return notes.filter((note) =>
    activeEntries.every(([key, selectedValues]) => {
      const noteValues = getFrontmatterValues(note, key)
      return selectedValues.some((value) => noteValues.includes(value))
    }),
  )
}
