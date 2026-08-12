import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

/**
 * Copies Bear's sqlite database (and any -wal/-shm companion files) to a
 * temp directory so it can be read without contending with Bear's own open
 * connection on the live file.
 *
 * @returns Path to the copied database file.
 */
export const copyDatabaseFile = async (sourcePath: string): Promise<string> => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "bear-sync-"))
  const destPath = path.join(tempDir, path.basename(sourcePath))

  await copyIfExists(sourcePath, destPath)
  await copyIfExists(`${sourcePath}-wal`, `${destPath}-wal`)
  await copyIfExists(`${sourcePath}-shm`, `${destPath}-shm`)

  return destPath
}

const copyIfExists = async (source: string, dest: string): Promise<void> => {
  try {
    await fs.copyFile(source, dest)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return
    throw error
  }
}
