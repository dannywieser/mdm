import { promises as fs } from "node:fs"

import type { SyncState } from "./syncState.types"

/** Loads the last-synced id -> modificationDate map, or an empty state on first run. */
export const loadSyncState = async (syncStatePath: string): Promise<SyncState> => {
  try {
    const raw = await fs.readFile(syncStatePath, "utf8")
    return JSON.parse(raw) as SyncState
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}
    throw error
  }
}
