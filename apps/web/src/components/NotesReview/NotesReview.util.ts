import type { Note } from "markdown"

import type { TocNote } from "../NotesReviewTableOfContents/NotesReviewTableOfContents.types"

interface ReadStateEntry { status: string; data?: boolean }

export const areReadStatesSettled = (readStates: ReadStateEntry[]): boolean =>
  readStates.length > 0 && readStates.every((s) => s.status !== "pending")

export const buildTocNotes = (notes: Note[], readStates: ReadStateEntry[]): TocNote[] =>
  notes.map((note, i) => ({
    id: note.id,
    obsidianUrl: note.obsidianUrl,
    title: note.title,
    isRead: readStates[i]?.data === true,
  }))
