import type { NotesRedisClient } from "./sources.types"

let notesRedisClient: NotesRedisClient | null = null

/** Called once at bootstrap by server.ts after connecting to Redis (bear source only). */
export const setNotesRedisClient = (client: NotesRedisClient | null): void => {
  notesRedisClient = client
}

export const getNotesRedisClient = (): NotesRedisClient | null => notesRedisClient
