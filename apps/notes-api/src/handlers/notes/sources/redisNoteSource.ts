import { loadScannedNotesFromHash } from "markdown"

import type { NoteSource, NotesRedisClient } from "./sources.types"

import { logger } from "../../../logger"

/**
 * Note source backed by notes pushed into Redis by notes-ingest (the Bear
 * sync path). Each hash field is a note ID, each value a JSON-serialized
 * ScannedNote.
 */
export const createRedisNoteSource = (redisClient: NotesRedisClient): NoteSource => ({
  listNotes: async () => {
    const notes = await loadScannedNotesFromHash(redisClient)

    logger.debug({ count: notes.length }, "[notes] redis note source loaded notes")

    return notes
  },
})
