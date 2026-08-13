import type { ScannedNote } from "markdown"

import { loadScannedNotesFromHash } from "markdown"

import { getNotesRedisClient } from "./notesRedisClient"

/** Loads every Bear-sourced note from Redis. Throws if no Redis client is available. */
export const loadBearNotes = async (): Promise<ScannedNote[]> => {
  const redisClient = getNotesRedisClient()
  if (!redisClient) {
    throw new Error("notesSource is \"bear\" but no Redis client is available")
  }

  return loadScannedNotesFromHash(redisClient)
}
