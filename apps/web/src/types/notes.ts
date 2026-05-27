import type { Note } from 'markdown'

export type { Note }

export interface NotesResponse {
  notes: Note[]
  notesDirectory: string
  obsidianVault: string
}
