import type { Note } from "markdown"

import { filterNotesWithImages } from "../NoteCoverGrid/NoteCoverGrid.util"

/** How many thumbnails a dashboard preview card shows. */
export const PREVIEW_NOTE_LIMIT = 10

function getNoteTimestamp(note: Note): number {
  const date = new Date(note.createdDate ?? note.modifiedDate)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

/**
 * Picks the notes a preview card renders: the most recent notes in the view
 * that actually have a cover image, capped at `limit`.
 */
export function selectPreviewNotes(
  notes: Note[],
  limit: number = PREVIEW_NOTE_LIMIT,
): Note[] {
  return filterNotesWithImages(notes)
    .slice()
    .sort((a, b) => getNoteTimestamp(b) - getNoteTimestamp(a))
    .slice(0, Math.max(limit, 0))
}
