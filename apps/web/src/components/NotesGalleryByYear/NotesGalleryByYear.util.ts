import type { Note } from "markdown"

export function getNoteYear(note: Note): number | null {
  if (!note.createdDate) return null

  const date = new Date(note.createdDate)
  if (Number.isNaN(date.getTime())) return null

  return date.getUTCFullYear()
}

export function groupNotesByYear(notes: Note[]): Map<number, Note[]> {
  const groups = new Map<number, Note[]>()

  for (const note of notes) {
    const year = getNoteYear(note)
    if (year === null) continue

    const yearNotes = groups.get(year) ?? []
    yearNotes.push(note)
    groups.set(year, yearNotes)
  }

  return new Map([...groups.entries()].sort(([a], [b]) => b - a))
}
