import type { ScannedNote } from "markdown"

import { BEAR_NOTES_HASH_KEY } from "markdown"

import type { NoteSource, NotesRedisClient } from "./sources.types"

import { logger } from "../../../logger"

/**
 * Note source backed by notes pushed into Redis by notes-ingest (the Bear
 * sync path). Each hash field is a note ID, each value a JSON-serialized
 * ScannedNote.
 */
export const createRedisNoteSource = (redisClient: NotesRedisClient): NoteSource => ({
  listNotes: async () => {
    const rawNotesById = await redisClient.hGetAll(BEAR_NOTES_HASH_KEY)
    const noteIds = Object.keys(rawNotesById)

    logger.debug({ count: noteIds.length }, "[notes] redis note source loaded notes")

    return noteIds
      .map((id) => parseScannedNote(id, rawNotesById[id]))
      .filter((note): note is ScannedNote => note !== null)
  },
})

const parseScannedNote = (id: string, raw: string | undefined): ScannedNote | null => {
  if (raw === undefined) return null

  try {
    return JSON.parse(raw) as ScannedNote
  } catch (error) {
    logger.error({ error, id }, "[notes] failed to parse note from redis, skipping")
    return null
  }
}
