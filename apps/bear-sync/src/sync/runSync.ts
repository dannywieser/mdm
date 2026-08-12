import type { BearSyncConfig } from "../config.types"
import type { SyncSummary } from "./runSync.types"
import type { SyncState } from "./syncState.types"

import { convertBearNoteToScannedNote } from "../convert/convertBearNoteToScannedNote"
import { coreDataTimestampToISOString } from "../convert/coreDataDate"
import { copyDatabaseFile } from "../db/copyDatabaseFile"
import { openBearDatabase } from "../db/openBearDatabase"
import { queryLiveNoteMetadata } from "../db/queryLiveNoteMetadata"
import { queryNotesByIds } from "../db/queryNotesByIds"
import { diffNoteIds } from "./diffNoteIds"
import { loadSyncState } from "./loadSyncState"
import { pushSyncPayload } from "./pushSyncPayload"
import { saveSyncState } from "./saveSyncState"

/**
 * Runs one incremental sync: diffs Bear's live notes against the last-synced
 * state, fetches and converts only what changed, pushes the diff to
 * notes-ingest, then persists the new state (only on a successful push, so
 * a failed run retries the same diff next time).
 */
export const runSync = async (config: BearSyncConfig): Promise<SyncSummary> => {
  const previousState = await loadSyncState(config.syncStatePath)
  const copiedDbPath = await copyDatabaseFile(config.bearDbPath)
  const db = openBearDatabase(copiedDbPath)

  try {
    const liveNotes = queryLiveNoteMetadata(db)
    const { changedIds, deletedIds } = diffNoteIds(liveNotes, previousState)

    const changedRows = queryNotesByIds(db, changedIds)
    const upserts = changedRows.map((row) =>
      convertBearNoteToScannedNote(row, config.dateFormats),
    )

    await pushSyncPayload(config.notesIngestUrl, { deletedIds, upserts })

    const nextState: SyncState = {}
    for (const note of liveNotes) {
      nextState[note.ZUNIQUEIDENTIFIER] = coreDataTimestampToISOString(note.ZMODIFICATIONDATE)
    }
    await saveSyncState(config.syncStatePath, nextState)

    return {
      deleted: deletedIds.length,
      unchanged: liveNotes.length - changedIds.length,
      upserted: upserts.length,
    }
  } finally {
    db.close()
  }
}
