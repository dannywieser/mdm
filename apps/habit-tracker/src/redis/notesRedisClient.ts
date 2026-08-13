import type { ScannedNotesRedisClient } from "markdown"

let notesRedisClient: ScannedNotesRedisClient | null = null

/** Called once at bootstrap by server.ts after connecting to Redis (bear source only). */
export const setNotesRedisClient = (client: ScannedNotesRedisClient | null): void => {
  notesRedisClient = client
}

export const getNotesRedisClient = (): ScannedNotesRedisClient | null => notesRedisClient
