import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { openBearDatabase } from "./openBearDatabase"

/**
 * Creates a consistent copy of Bear's live sqlite database into a fresh
 * temp directory, using SQLite's Online Backup API (better-sqlite3's
 * Database#backup) rather than a raw filesystem copy. Bear's database uses
 * the classic rollback-journal format (not WAL), where writes happen
 * in-place in the main file — a raw byte copy caught mid-write can capture
 * a torn, internally inconsistent snapshot. The backup API instead reads a
 * consistent snapshot through SQLite's own locking protocol, safe
 * regardless of concurrent writes from Bear. The source connection is
 * opened read-only, so it can never write to Bear's live file.
 *
 * @returns Path to the backed-up database file.
 */
export const backupDatabaseFile = async (sourcePath: string): Promise<string> => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "bear-sync-"))
  const destPath = path.join(tempDir, path.basename(sourcePath))

  const sourceDb = openBearDatabase(sourcePath)

  try {
    await sourceDb.backup(destPath)
  } finally {
    sourceDb.close()
  }

  return destPath
}
