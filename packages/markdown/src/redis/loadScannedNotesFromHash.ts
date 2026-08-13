import type { ScannedNote } from "../types"
import type { ScannedNotesRedisClient } from "./loadScannedNotesFromHash.types"

import { BEAR_NOTES_HASH_KEY } from "../noteSync"

const parseScannedNote = (raw: string): ScannedNote | null => {
  try {
    return JSON.parse(raw) as ScannedNote
  } catch {
    return null
  }
}

/**
 * Loads every note notes-ingest has written into the Bear notes hash,
 * skipping any value that fails to parse as a ScannedNote.
 */
export const loadScannedNotesFromHash = async (
  redisClient: ScannedNotesRedisClient,
): Promise<ScannedNote[]> => {
  const rawNotesById = await redisClient.hGetAll(BEAR_NOTES_HASH_KEY)

  return Object.values(rawNotesById)
    .map(parseScannedNote)
    .filter((note): note is ScannedNote => note !== null)
}
