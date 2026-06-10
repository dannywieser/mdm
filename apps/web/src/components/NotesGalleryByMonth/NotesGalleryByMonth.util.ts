import type { Note } from "markdown"

import type { NoteYearMonth } from "./NotesGalleryByMonth.types"

export function getNoteYearMonth(note: Note): NoteYearMonth | null {
  const date = new Date(note.createdDate ?? note.modifiedDate)
  if (Number.isNaN(date.getTime())) return null

  return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() }
}

export function groupNotesByMonth(notes: Note[], year: number): Map<number, Note[]> {
  const groups = new Map<number, Note[]>()

  for (const note of notes) {
    const yearMonth = getNoteYearMonth(note)
    if (!yearMonth || yearMonth.year !== year) continue

    const monthNotes = groups.get(yearMonth.month) ?? []
    monthNotes.push(note)
    groups.set(yearMonth.month, monthNotes)
  }

  return new Map([...groups.entries()].sort(([a], [b]) => a - b))
}

export function getMonthName(month: number): string {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  })
}

export function getMostRecentYear(notes: Note[]): number {
  const years = notes.map(getNoteYearMonth).filter((yearMonth): yearMonth is NoteYearMonth => yearMonth !== null)
    .map(({ year }) => year)

  return years.length > 0 ? Math.max(...years) : new Date().getUTCFullYear()
}
