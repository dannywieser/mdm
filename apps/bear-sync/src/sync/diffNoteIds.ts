import type { BearNoteMetadataRow } from "../db/db.types"
import type { SyncState } from "./syncState.types"

import { coreDataTimestampToISOString } from "../convert/coreDataDate"

export interface NoteIdDiff {
  changedIds: string[]
  deletedIds: string[]
}

/**
 * Diffs the current live (non-trashed) note set against the last-synced
 * state: notes that are new or have a newer modification date are
 * "changed" (need a full fetch + push), and notes present in the previous
 * state but missing from the live set are "deleted" (trashed, archived, or
 * removed since the last sync).
 */
export const diffNoteIds = (
  liveNotes: readonly BearNoteMetadataRow[],
  previousState: SyncState,
): NoteIdDiff => {
  const liveIds = new Set<string>()
  const changedIds: string[] = []

  for (const note of liveNotes) {
    const id = note.ZUNIQUEIDENTIFIER
    liveIds.add(id)

    const modifiedDate = coreDataTimestampToISOString(note.ZMODIFICATIONDATE)
    if (previousState[id] !== modifiedDate) {
      changedIds.push(id)
    }
  }

  const deletedIds = Object.keys(previousState).filter((id) => !liveIds.has(id))

  return { changedIds, deletedIds }
}
