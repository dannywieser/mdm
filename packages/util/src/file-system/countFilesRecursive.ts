import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * Counts all files recursively within a directory.
 *
 * @param directory Absolute path to the directory to count files in.
 * @returns Total number of files found; returns 0 if the directory does not exist or is unreadable.
 */
export const countFilesRecursive = async (directory: string): Promise<number> => {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    let count = 0
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += await countFilesRecursive(path.join(directory, entry.name))
      } else if (entry.isFile()) {
        count += 1
      }
    }
    return count
  } catch {
    return 0
  }
}
