import type { ResolvedNotesConfig } from "app-config"

import type { NoteSource, NotesRedisClient } from "./sources.types"

import { createFileNoteSource } from "./fileNoteSource"
import { createRedisNoteSource } from "./redisNoteSource"

/** Picks the note source implementation for the configured notesSource. */
export const resolveNoteSource = (
  notesConfig: ResolvedNotesConfig,
  redisClient: NotesRedisClient | null,
): NoteSource => {
  if (notesConfig.notesSource === "bear") {
    if (!redisClient) {
      throw new Error("notesSource is \"bear\" but no Redis client is available")
    }
    return createRedisNoteSource(redisClient)
  }

  return createFileNoteSource(notesConfig)
}
