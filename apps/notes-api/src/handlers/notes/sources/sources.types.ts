import type { ScannedNote } from "../notes.types"

export interface NoteSource {
  listNotes: () => Promise<ScannedNote[]>
}

export interface NotesRedisClient {
  hGetAll: (key: string) => Promise<Record<string, string>>
}
