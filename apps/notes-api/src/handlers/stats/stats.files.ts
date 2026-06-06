import { promises as fs } from "node:fs"
import path from "node:path"

export const countFilesRecursive = async (directory: string): Promise<number> => {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const counts = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
          return countFilesRecursive(fullPath)
        }
        return entry.isFile() ? 1 : 0
      }),
    )
    return counts.reduce((sum, n) => sum + n, 0)
  } catch {
    return 0
  }
}
