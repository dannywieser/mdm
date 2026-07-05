import { promises as fs } from "node:fs"
import path from "node:path"

const UNKNOWN_EXTENSION_KEY = "unknown"

/**
 * Recursively counts files within a directory, grouped by lowercased extension
 * (without the leading dot). Files with no extension are grouped under `"unknown"`.
 *
 * @param directory Absolute path to the directory to walk.
 * @returns A map of extension to file count; returns an empty map if the directory does not exist or is unreadable.
 */
export const countFilesByExtension = async (directory: string): Promise<Record<string, number>> => {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const counts: Record<string, number> = {}

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const nestedCounts = await countFilesByExtension(path.join(directory, entry.name))
        for (const [extension, count] of Object.entries(nestedCounts)) {
          counts[extension] = (counts[extension] ?? 0) + count
        }
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name).slice(1).toLowerCase() || UNKNOWN_EXTENSION_KEY
        counts[extension] = (counts[extension] ?? 0) + 1
      }
    }

    return counts
  } catch {
    return {}
  }
}
