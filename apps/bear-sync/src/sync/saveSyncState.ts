import { promises as fs } from "node:fs"
import path from "node:path"

import type { SyncState } from "./syncState.types"

/** Persists the id -> modificationDate map. Only call after a successful push, so a failed sync retries the same diff next run. */
export const saveSyncState = async (syncStatePath: string, state: SyncState): Promise<void> => {
  await fs.mkdir(path.dirname(syncStatePath), { recursive: true })
  await fs.writeFile(syncStatePath, JSON.stringify(state, null, 2), "utf8")
}
