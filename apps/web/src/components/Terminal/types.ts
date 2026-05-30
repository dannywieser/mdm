import type { Note } from 'markdown'

export type HistoryEntry =
  | { id: string; type: 'command'; command: string }
  | { id: string; type: 'otd'; notes: Note[] }
  | { id: string; type: 'help' }
  | { id: string; type: 'error'; errorMessage: string }
