import type { BearDatabase, BearNoteMetadataRow } from "./db.types"

/** Cheap metadata-only scan of every non-trashed note, used to diff for changes/deletions. */
export const queryLiveNoteMetadata = (db: BearDatabase): BearNoteMetadataRow[] =>
  db
    .prepare("SELECT ZUNIQUEIDENTIFIER, ZMODIFICATIONDATE FROM ZSFNOTE WHERE ZTRASHED = 0")
    .all() as BearNoteMetadataRow[]
