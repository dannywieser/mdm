import type { Note } from 'markdown'

export interface NotesResponse {
  headerDateFormat: string
  notes: Note[]
  notesDirectory: string
  obsidianVault: string
}
