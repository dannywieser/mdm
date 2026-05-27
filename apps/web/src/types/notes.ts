import type { Note } from 'markdown'

export interface NotesResponse {
  notes: Note[]
  notesDirectory: string
  obsidianVault: string
}
