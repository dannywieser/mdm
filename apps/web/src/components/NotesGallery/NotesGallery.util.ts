import type { Note } from "markdown"

export interface SearchableNote {
  haystack: string
  note: Note
}

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
