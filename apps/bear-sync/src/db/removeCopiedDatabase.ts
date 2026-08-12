import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * Removes the temp directory backupDatabaseFile created for one sync run —
 * the whole directory, not just the .sqlite file, since -wal/-shm
 * companions may also have been copied alongside it.
 */
export const removeCopiedDatabase = async (copiedDbPath: string): Promise<void> => {
  await fs.rm(path.dirname(copiedDbPath), { force: true, recursive: true })
}
